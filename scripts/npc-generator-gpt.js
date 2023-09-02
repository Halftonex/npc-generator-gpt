const MODULE_ID = "npc-generator-gpt";
const LOG_PREFIX = "NPC Generator (GPT) |";
const TEMPLATE_PATH = `modules/${MODULE_ID}/templates`;
const TEMPLATE_DIALOG = `${TEMPLATE_PATH}/dialog.hbs`;
const TEMPLATE_QUERY = `${TEMPLATE_PATH}/query.hbs`;
const TEMPLATE_SHEET = `${TEMPLATE_PATH}/sheet.hbs`;
const API_URL = {
    OPENAI: "https://api.openai.com/v1/chat/completions",
    BETTER: "https://free.churchless.tech/v1/chat/completions"
}
const MODEL_NAME = "gpt-3.5-turbo";
const HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
const test = `{
    "name": "Lucius Martell",
    "background": "Nato in un piccolo villaggio, Lucius è cresciuto in una famiglia di fabbri. Da ragazzo, è sempre stato affascinato dalle storie di eroi e avventure e ha deciso di diventare un guerriero per proteggere gli innocenti. Si è allenato duramente sotto la guida di un veterano locale prima di lasciare la sua casa per cercare la sua sorte.",
    "appearance": "Lucius è un uomo di statura media con muscoli ben sviluppati. Ha capelli neri corti e occhi marroni. Indossa un'armatura di maglia e porta sempre con sé il suo spadone, un'eredità di famiglia.",
    "roleplaying": "Lucius è un individuo serio e determinato, sempre pronto a prendere le redini della situazione. Crede fermamente nel concetto di giustizia e non esiterà a intervenire quando vede degli innocenti in pericolo. Tuttavia, è anche una persona con un buon cuore e sarà sempre pronto a dare una seconda possibilità.",
    "equip": "<ul><li>Spadone</li><li>Armatura di maglia</li><li>Scudo</li><li>Kit da sopravvivenza</li></ul>",
    "spells": "<ul><li>–</li></ul>"
}`;

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
        this.preferences = {};
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

    _initPreferences() {
        this.preferences.units = (game.settings.get(MODULE_ID, "movementUnits")) ? 'm' : 'ft';

        this.element.find('.npc-generator-gpt select').each((index, element) => {
            const key = $(element).attr('id');
            let value = $(element).find('option:selected').val();
            let label = $(element).find('option:selected').text();

            if (value === 'random') {
                const options = $(element).find('option').map(function () {
                    return { value: $(this).val(), label: $(this).text() };
                }).get();

                const filteredOptions = options.filter(option => option.value !== 'random');
                const randomOption = filteredOptions[Math.floor(Math.random() * filteredOptions.length)];

                value = randomOption.value;
                label = randomOption.label;
            }

            this.preferences[key] = { value: value, label: label };
        });

        this.preferences.race = {...this.preferences.race, ...this._getRaceStats(this.preferences.race.value)};
        this.preferences.class = { ...this.preferences.class, ...this._getClassStats(this.preferences.class.value)};
        this.preferences.stats = this._getNPCStats(this.preferences.cr.value);
        this.preferences.abilities = this._getAbilityStats(this.preferences.class.save);
    }    
    
    async callGPT() {
        if (this.isRequesting) {
            ui.notifications.warn(game.i18n.localize("npc-generator-gpt.status.wait"));
            return;
        }

        const button = this.element.find('#npcGen_create-btn');
        button.text(game.i18n.localize("npc-generator-gpt.dialog.buttonPending"));

        this._initPreferences();

        const content = await this._initQuery();
        const requestConfig = this._getRequestConfig(content);
        const apiURL = (game.settings.get(MODULE_ID, "apiKey")) ? API_URL.OPENAI : API_URL.BETTER;
        
        this.isRequesting = true;
        console.log(`${LOG_PREFIX} Sending Request`);

        try {
            const response = await fetch(apiURL, requestConfig);
            const responseData = await response.json();

            if (!response.ok) {
                const errorMsg = (typeof responseData.error.message === 'string') ? responseData.error.message : responseData.error.message.message;
                ui.notifications.error(game.i18n.localize("npc-generator-gpt.status.error"));
                throw new Error(`${response.status} | Message: ${errorMsg}`);
            }

            this._onCreateNPC(responseData);
        } catch (error) {
            console.error(error);
        } finally {
            button.text(game.i18n.localize("npc-generator-gpt.dialog.button"));
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
            headers: {...HEADERS, 'Authorization': `Bearer ${game.settings.get(MODULE_ID, "apiKey")}`}
        };
    }

    async _onCreateNPC(gptData) {
        gptData = this._convertGPTData(gptData);
        const data = {...this.preferences, ...gptData}

        try {

            const { name, cr, alignment, abilities, race, class: classInfo , stats, units, ...rest } = data;
            const fakeAlign = (game.settings.get(MODULE_ID, "hideAlignment")) ? game.i18n.localize("npc-generator-gpt.sheet.unknown") : alignment.label;
            const bioContent = await this._getTemplateStructure(TEMPLATE_SHEET, data);

            await Actor.create({
                name: name,
                type: "npc",
                system: {
                    details: {
                        source: game.i18n.localize("npc-generator-gpt.sheet.source"),
                        cr: cr.value,
                        alignment: fakeAlign,
                        race: race.label,
                        biography: { value: bioContent },
                        type: { value: race.type, subtype: race.label }
                    },
                    traits: { size: race.size, languages: { value: race.lang } },
                    abilities: abilities,
                    attributes: {
                        hp: { value: stats.hp, max: stats.hp },
                        ac: { value: stats.ac },
                        movement: { units: units, walk: race.speed },
                        senses: { units: units, darkvision: race.darkvision }
                    },
                    skills: classInfo.skills
                }
            });

            this.close();
            ui.notifications.info(game.i18n.format("npc-generator-gpt.status.done", { npcName: name }));
        } catch (error) {
            console.error(`${LOG_PREFIX} Error during NPC creation:`, error);
            ui.notifications.error(game.i18n.localize("npc-generator-gpt.status.error3"));
        }
    }

    async _initQuery() {
        const options = `${this.preferences.gender.label}, ${this.preferences.race.label}, ${this.preferences.class.label}, ${this.preferences.alignment.label}`;
        const template = await this._getTemplateStructure(TEMPLATE_QUERY);
        const query = `${game.i18n.format("npc-generator-gpt.query.pre", { userQuery: options })} ${template}`;

        return query;
    }    

    _convertGPTData(content) {
        content = content.choices[0].message.content;
        const regex = /```json([\s\S]*?)```/;
        const match = regex.exec(content);
        const errorMsg = game.i18n.localize("npc-generator-gpt.status.error2");

        if (match) {
            const jsonString = match[1].trim();
            try {
                return JSON.parse(jsonString);
            } catch (error) {
                ui.notifications.error(errorMsg);
                throw new Error(error.message);
            }
        } else {
            try {
                return JSON.parse(content);
            } catch (error) {
                ui.notifications.error(errorMsg);
                throw new Error(error.message);
            }
        }
    }    

    async _getTemplateStructure(path, data) {
        try {
            const template = await renderTemplate(path, data);
            return template
        } catch (error) { console.error(error) }
    }

    _getRaceStats(npc_race) {
        const raceStats = {
            dragonborn: {type: "humanoid", speed: 30, size: 'med', darkvision: 0, lang: {0: "common", 1: "draconic"}},
            dwarf: {type: "humanoid", speed: 25, size: 'med', darkvision: 60, lang: {0: "common", 1: "dwarvish"}},
            elf: {type: "humanoid", speed: 30, size: 'med', darkvision: 60, lang: {0: "common", 1: "elvish"}},
            gnome: {type: "humanoid", speed: 25, size: 'sm', darkvision: 60, lang: {0: "common", 1: "gnomish"}},
            halfelf: {type: "humanoid", speed: 30, size: 'med', darkvision: 60, lang: {0: "common", 1: "elvish"}},
            halfling: {type: "humanoid", speed: 25, size: 'sm', darkvision: 0, lang: {0: "common", 1: "halfling"}},
            halforc: {type: "humanoid", speed: 30, size: 'med', darkvision: 60, lang: {0: "common", 1: "orc"}},
            human: {type: "humanoid", speed: 30, size: 'med', darkvision: 0, lang: {0: "common"}},
            tiefling: {type: "humanoid", speed: 30, size: 'med', darkvision: 60, lang: {0: "common", 1: "infernal"}}
        }

        const info = { ...raceStats[npc_race] };
        if (this.preferences.units === 'm') {
            info.speed *= 0.3;
            info.darkvision *= 0.3;
        }

        return info
    }

    _getClassStats(npc_class) {
        const classStats = {
            barbarian: { save: { str: 1, con: 1 }, skills: { max: 2, pool: ['ani', 'ath', 'itm', 'nat', 'prc', 'sur'] } },
            bard: { save: { dex: 1, cha: 1 }, skills: { max: 3, pool: ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inv', 'itm', 'med', 'nat', 'per', 'prc', 'prf', 'rel', 'slt', 'ste', 'sur'] } },
            cleric: { save: { wis: 1, cha: 1 }, skills: { max: 2, pool: ['his', 'ins', 'med', 'per', 'rel'] } },
            druid: { save: { int: 1, wis: 1 }, skills: { max: 2, pool: ['ani', 'arc', 'ins', 'med', 'nat', 'prc', 'rel', 'sur'] } },
            fighter: { save: { str: 1, con: 1 }, skills: { max: 2, pool: ['acr', 'ani', 'ath', 'itm', 'ins', 'prc', 'sur', 'his'] } },
            monk: { save: { str: 1, dex: 1 }, skills: { max: 2, pool: ['acr', 'ath', 'ste', 'ins', 'rel', 'his'] } },
            paladin: { save: { wis: 1, cha: 1 }, skills: { max: 2, pool: ['ath', 'itm', 'ins', 'med', 'per', 'rel'] } },
            ranger: { save: { str: 1, dex: 1 }, skills: { max: 3, pool: ['ani', 'ath', 'ste', 'inv', 'ins', 'nat', 'prc', 'sur'] } },
            rogue: { save: { dex: 1, int: 1 }, skills: { max: 4, pool: ['acr', 'ath', 'ste', 'inv', 'dec', 'itm', 'prf', 'ins', 'prc', 'per', 'slt'] } },
            sorcerer: { save: { con: 1, cha: 1 }, skills: { max: 2, pool: ['arc', 'dec', 'itm', 'ins', 'per', 'rel'] } },
            warlock: { save: { wis: 1, cha: 1 }, skills: { max: 2, pool: ['arc', 'inv', 'dec', 'itm', 'nat', 'rel', 'his'] } },
            wizard: { save: { int: 1, wis: 1 }, skills: { max: 2, pool: ['arc', 'inv', 'ins', 'med', 'rel', 'his'] } }
        }

        const skillAbilities = {
            acr: 'dex',
            ani: 'wis',
            arc: 'int',
            ath: 'str',
            dec: 'cha',
            his: 'int',
            ins: 'wis',
            inv: 'int',
            itm: 'cha',
            med: 'wis',
            nat: 'int',
            per: 'cha',
            prc: 'wis',
            prf: 'cha',
            rel: 'int',
            slt: 'dex',
            ste: 'dex',
            sur: 'wis'
        }

        const info = { ...classStats[npc_class] };

        const newSkills = {};

        const shuffledPool = [...info.skills.pool];
        for (let i = shuffledPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
        }
        const randomSkills = shuffledPool.slice(0, info.skills.max);

        for (const skill of randomSkills) {
            newSkills[skill] = { value: 1, ability: skillAbilities[skill] };
        }

        info.skills = newSkills;
        return info;
    }

    _getAbilityStats(npc_class) {
        const abilities = { 
            str: {},
            dex: {},
            con: {},
            int: {},
            wis: {},
            cha: {}
        }

        for (const ability in abilities) abilities[ability] = { value: this._roll4d6DropLowest(), proficient: npc_class[ability] ?? 0 };
        return abilities
    }

    _getNPCStats(npc_cr) {
        const crTable = {
            0: { ac: { min: 10, max: 13 }, hp: { min: 1, max: 6 } },
            0.125: { ac: 13, hp: { min: 7, max: 35 } },
            0.25: { ac: 13, hp: { min: 36, max: 49 } },
            0.5: { ac: 13, hp: { min: 50, max: 70 } },
            1: { ac: 13, hp: { min: 71, max: 85 } },
            2: { ac: 13, hp: { min: 86, max: 100 } },
            3: { ac: 13, hp: { min: 101, max: 115 } },
            4: { ac: 14, hp: { min: 116, max: 130 } },
            5: { ac: 15, hp: { min: 131, max: 145 } },
            6: { ac: 15, hp: { min: 146, max: 160 } },
            7: { ac: 15, hp: { min: 161, max: 175 } },
            8: { ac: 16, hp: { min: 176, max: 190 } },
            9: { ac: 16, hp: { min: 191, max: 205 } },
            10: { ac: 17, hp: { min: 206, max: 220 } },
            11: { ac: 17, hp: { min: 221, max: 235 } },
            12: { ac: 17, hp: { min: 236, max: 250 } },
            13: { ac: 18, hp: { min: 251, max: 265 } },
            14: { ac: 18, hp: { min: 266, max: 280 } },
            15: { ac: 18, hp: { min: 281, max: 295 } },
            16: { ac: 18, hp: { min: 296, max: 310 } },
            17: { ac: 19, hp: { min: 311, max: 325 } },
            18: { ac: 19, hp: { min: 326, max: 340 } },
            19: { ac: 19, hp: { min: 341, max: 355 } },
            20: { ac: 19, hp: { min: 356, max: 400 } },
            21: { ac: 19, hp: { min: 401, max: 445 } },
            22: { ac: 19, hp: { min: 446, max: 490 } },
            23: { ac: 19, hp: { min: 491, max: 535 } },
            24: { ac: 19, hp: { min: 536, max: 580 } },
            25: { ac: 19, hp: { min: 581, max: 625 } },
            26: { ac: 19, hp: { min: 626, max: 670 } },
            27: { ac: 19, hp: { min: 671, max: 715 } },
            28: { ac: 19, hp: { min: 716, max: 760 } },
            29: { ac: 19, hp: { min: 761, max: 805 } },
            30: { ac: 19, hp: { min: 806, max: 850 } }
        };

        const info = crTable[npc_cr];
        info.hp = getRandomInt(info.hp.min, info.hp.max);
        info.ac = (npc_cr === '0') ? getRandomInt(info.ac.min, info.ac.max) : info.ac;
        return info
    }

    _roll4d6DropLowest() {
        const rolls = [];
        for (let i = 0; i < 4; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        rolls.sort((a, b) => a - b);
        rolls.shift();
        return rolls.reduce((a, b) => a + b, 0);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
