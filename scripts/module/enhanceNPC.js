import { COSTANTS, isRequesting, npcGenGPTLib } from "./lib.js";
import { npcGenGPTDataStructure } from "./dataStructures.js";

export class npcGenGPTEnhanceNPC extends Application {
    constructor(npc) {
        super();
        this.npc = npc;
        this.data = {};
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: COSTANTS.MODULE_ID,
            title: game.i18n.localize("npc-generator-gpt.enhance.title"),
            template: `modules/${COSTANTS.MODULE_ID}/templates/${COSTANTS.TEMPLATE.ENHANCE}`,
            width: 300,
            height: 170
        });
    }

    async getData(options) {
        const data = await super.getData(options);
        data.selectOptions = npcGenGPTLib.getDialogOptions('cr', true)
          .filter(obj => obj.value !== "random") 
          .map(obj => {
            if (obj.value === this.npc.system.details.cr) {
              return { ...obj, isSelected: 'selected' };
            }
            return obj;
          });
        return data;
      }      

    activateListeners(html) {
        super.activateListeners(html);
        html.find('#npcGenGPT_enhance-btn').click(this.initEnhancing.bind(this));
    }

    async initEnhancing() {
        if (isRequesting) {
            ui.notifications.warn(`${COSTANTS.LOG_PREFIX} ${game.i18n.localize("npc-generator-gpt.status.wait")}`);
            return;
        }

        const button = this.element.find('#npcGenGPT_enhance-btn');
        button.text(game.i18n.localize("npc-generator-gpt.dialog.buttonPending"));

        const isBackgroundChecked = this.element.find('#background').prop('checked');
        const selectedCR = this.element.find('#cr').val();

        if (isBackgroundChecked) {
            this.data.gptData = await npcGenGPTLib.callAI(this.initBackgroundNPC());
        }

        if (selectedCR != this.npc.system.details.cr) {
            this.data.npcData = this.initEnhanceNPC(selectedCR);
        }

        button.text(game.i18n.localize("npc-generator-gpt.enhance.button"));
        if (this.data.gptData || this.data.npcData) this.updateNPC();
    }

    initBackgroundNPC() {
        const npc = this.npc;
        const type = npc.system.details.type;
        const race = type.value === 'custom' ? type.custom : type.subtype ? `${type.value} (${type.subtype})` : type.value;
        const options = `${npc.name}, ${race}, ${npc.system.details.alignment}`;
        return npcGenGPTDataStructure.getEnhanceQueryTemplate(options);
    }

    initEnhanceNPC(npcCR) {
        const npcAbilities = this.getNpcAbilities(npcCR);
        return {
            abilities: npcAbilities,
            attributes: this.getNpcAttributes(npcCR, npcAbilities.con.value),
            currency: npcGenGPTLib.getNpcCurrency(npcCR),
            details: this.getNpcDetails(npcCR)
        }
    }

    async updateNPC() {
        try {
            const npcData = (this.data.npcData) ? this.data.npcData : { details: { biography: {} } };
            if (this.data.gptData) {
                npcData.details.biography.value = await npcGenGPTLib.getTemplateStructure(COSTANTS.TEMPLATE.ENHANCESHEET, this.data.gptData);
            }

            await this.npc.update({ system: npcData });
            this.close();

            ui.notifications.info(`${COSTANTS.LOG_PREFIX} ${game.i18n.format("npc-generator-gpt.status.enhance", { npcName: this.npc.name })}`);
        } catch (error) {
            console.error(`${COSTANTS.LOG_PREFIX} Error during NPC Update:`, error);
            ui.notifications.error(`${COSTANTS.LOG_PREFIX} ${game.i18n.localize("npc-generator-gpt.status.error3")}`);
        }
    }

    getNpcAbilities(npcCR) {
        const profAbilities = npcGenGPTLib.getProficentAbilities(this.npc.system.abilities);
        const npcAbilities = npcGenGPTLib.getNpcAbilities(profAbilities);
        return npcGenGPTLib.scaleAbilities(npcAbilities, npcCR)
    }

    getNpcAttributes(npcCR, npcCon) {
        const npcHp = npcGenGPTLib.getNpcHp(npcCR, npcCon, this.npc.system.traits.size); 
        return {
            hp: { value: npcHp.value, max: npcHp.value, formula: npcHp.formula },
            ac: { value: npcGenGPTLib.getNpcAC(npcCR) }
        }
    }

    getNpcDetails(npcCR) {
        return {
            source: "NPC Generator (GPT)",
            cr: npcCR,
            biography: {}
        }
    }
}
