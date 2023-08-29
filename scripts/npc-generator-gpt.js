const MODULE_ID = "npc-generator-gpt";
const LOG_PREFIX = "NPC Generator (GPT) |";
const TEMPLATE_PATH = `modules/${MODULE_ID}/templates`;
const TEMPLATE_DIALOG = `${TEMPLATE_PATH}/dialog.hbs`;
const TEMPLATE_QUERY = `${TEMPLATE_PATH}/query.hbs`;
const TEMPLATE_SHEET = `${TEMPLATE_PATH}/sheet.hbs`;
const API_URL = "https://free.churchless.tech/v1/chat/completions";
const MODEL_NAME = "gpt-3.5-turbo";
const HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

Hooks.on("renderActorDirectory", async (app, html) => {
    if (game.user.isGM) {
        if (app instanceof ActorDirectory) {
            let button = $(`<button class='npc-generator-gpt'><i class='fas fa-address-card'></i> ${game.i18n.localize("npc-generator-gpt.button")}</button>`)

            button.click(function () {
                new NPCGeneratorGPT().render(true)
            });

            html.find(".directory-header .header-actions").append(button);
        }
    }
})

class NPCGeneratorGPT extends Application {
    constructor() {
        super();
        this.isRequesting = false;
        this.dnd5eUnits = { units: (game.settings.get(MODULE_ID, "movementUnits")) ? "m" : "ft" };
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: MODULE_ID,
            title: game.i18n.localize("npc-generator-gpt.dialog.title"),
            template: TEMPLATE_DIALOG,
            width: 300
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('#npcGen_create-btn').click(this.callGPT.bind(this));
    }

    async callGPT() {
        if (this.isRequesting) {
            ui.notifications.warn(game.i18n.localize("npc-generator-gpt.status.wait"));
            return;
        }

        const content = await this._initQuery();
        const requestConfig = this._getRequestConfig(content);
        this.isRequesting = true;

        console.log(`${LOG_PREFIX} Sending Request`);
        ui.notifications.info(game.i18n.localize("npc-generator-gpt.status.pending"));

        try {
            const response = await fetch(API_URL, requestConfig);
            const responseData = await response.json();

            if (!response.ok) {
                const apiError = typeof responseData.error.message === 'string' ? responseData.error.message : responseData.error.message.message;
                ui.notifications.error(`ChatGPT |  ${apiError}`);
                throw new Error(response.status);
            }

            this._onCreateNPC(responseData);

        } catch (error) {
            console.error(error);
        } finally {
            this.isRequesting = false;
        }
    }

    _getRequestConfig(content) {
        return {
            method: "POST",
            body: JSON.stringify({
                "model": MODEL_NAME,
                "messages": [
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "temperature": game.settings.get(MODULE_ID, "temperature"),
                "top_p": game.settings.get(MODULE_ID, "top_p"),
                "frequency_penalty": game.settings.get(MODULE_ID, "freq_penality"),
                "presence_penalty": game.settings.get(MODULE_ID, "pres_penality")
            }),
            headers: HEADERS
        };
    }

    async _onCreateNPC(data) {
        data = this._convertGPTData(data);
        if (!data) return;

        try {
            
            const { name, stats, race, size, appearance, ...rest } = data;
            const fakeAlign = (game.settings.get(MODULE_ID, "hideAlignment")) ? game.i18n.localize("npc-generator-gpt.sheet.unknown") : data.alignment;
            const bioContent = await this._getTemplateStructure(TEMPLATE_SHEET, data);

            await Actor.create({
                name: name,
                type: "npc",
                system: {
                    details: {
                        source: game.i18n.localize("npc-generator-gpt.sheet.source"),
                        cr: stats.cr,
                        alignment: fakeAlign,
                        race: race,
                        biography: { value: bioContent },
                        type: { value: "custom", custom: race }
                    },
                    traits: { size: size },
                    abilities: this._getAbilitiesFromStats(stats),
                    attributes: {
                        hp: { value: stats.hp, max: stats.hp },
                        movement: { units: this.dnd5eUnits.units , walk: stats.movement }
                    },
                    skills: this._getSkillsFromStats(stats)
                }
            });

            this.close();
            ui.notifications.info(game.i18n.localize("npc-generator-gpt.status.done"));
        } catch (error) {
            console.error(`${LOG_PREFIX} Error during NPC creation:`, error);
            ui.notifications.error(game.i18n.localize("npc-generator-gpt.status.error_gen"));
        }
    }

    async _initQuery() {
        const ids = ['gender', 'race', 'class', 'cr', 'alignment'];
        const langRandom = game.i18n.localize("npc-generator-gpt.dialog.random");

        const selectedOptions = ids.map(info => {
            const data = this.element.find(`#${info} option:selected`).text();
            return (data === langRandom) ? '' : (info === 'cr') ? `CR ${data}` : data;
        }).filter(Boolean);
        
        const template = await this._getTemplateStructure(TEMPLATE_QUERY, this.dnd5eUnits);

        const query = [
            game.i18n.localize("npc-generator-gpt.query.pre"),
            ...selectedOptions,
            game.i18n.localize("npc-generator-gpt.query.post"),
            template
        ].join(' ');

        return query;
    }

    _convertGPTData(content) { 
        try {
            const regex = /```json([\s\S]*?)```/;
            content = JSON.parse(regex.exec(content.choices[0].message.content)[1]);
            return content;
        } catch (error) {
            console.error(game.i18n.localize("npc-generator-gpt.status.error_conv"), error);
            ui.notifications.error(game.i18n.localize("npc-generator-gpt.status.error_conv"));
            return null;
        }
    } 

    async _getTemplateStructure(path, data) {
        try {
            const template = await renderTemplate(path, data);
            return template
        } catch (error) { console.error(error) }
    }

    _getAbilitiesFromStats(stats) {
        return {
            str: { value: stats.attr.str, proficient: stats.prof.str },
            dex: { value: stats.attr.dex, proficient: stats.prof.dex },
            con: { value: stats.attr.con, proficient: stats.prof.con },
            int: { value: stats.attr.int, proficient: stats.prof.int },
            wis: { value: stats.attr.wis, proficient: stats.prof.wis },
            cha: { value: stats.attr.cha, proficient: stats.prof.cha }
        };
    }

    _getSkillsFromStats(stats) {
        return {
            acr: { value: stats.skills.acr },
            ani: { value: stats.skills.ani },
            arc: { value: stats.skills.arc },
            ath: { value: stats.skills.ath },
            dec: { value: stats.skills.dec },
            his: { value: stats.skills.his },
            ins: { value: stats.skills.ins },
            inv: { value: stats.skills.inv },
            itm: { value: stats.skills.itm },
            med: { value: stats.skills.med },
            nat: { value: stats.skills.nat },
            per: { value: stats.skills.per },
            prc: { value: stats.skills.prc },
            prf: { value: stats.skills.prf },
            rel: { value: stats.skills.rel },
            slt: { value: stats.skills.slt },
            ste: { value: stats.skills.ste },
            sur: { value: stats.skills.sur }
        };
    }
}
