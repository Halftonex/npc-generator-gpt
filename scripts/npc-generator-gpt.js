import { npcGenGPTSettings } from "./module/settings.js";
import { npcGenGPTGenerateNPC } from "./module/generateNPC.js";
import { npcGenGPTEnhanceNPC } from "./module/enhanceNPC.js";

Hooks.once('ready', () => {
    console.log("NPC Generator (GPT) | Initializing Settings")
    new npcGenGPTSettings();
});

Hooks.on("renderActorDirectory", async (app, html) => {
    if (game.user.isGM && app instanceof ActorDirectory) {
        let button = $(`<button class='npc-generator-gpt'><i class='fas fa-address-card'></i> ${game.i18n.localize("npc-generator-gpt.button")}</button>`)

        button.click(function () {
            new npcGenGPTGenerateNPC().render(true)
        });

        html.find(".directory-header .header-actions").append(button);
    }
});

Hooks.on("getActorSheetHeaderButtons", async (app, buttons) => {
    if (game.user.isGM && app.object.type === 'npc') {
        buttons.unshift({
            label: 'NGG',
            class: 'npc-generator-gpt',
            icon: 'fa-light fa-atom',
            onclick: ev => { new npcGenGPTEnhanceNPC(app.object).render(true) }
        });
    }
});
