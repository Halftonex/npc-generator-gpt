import { npcGenGPTDataStructure } from "./dataStructures.js"
import { Fuse } from "../lib/fuse.mjs"

export const COSTANTS = {
    MODULE_ID: "npc-generator-gpt",
    LOG_PREFIX: "NPC Generator (GPT) |",
    API_URL: "https://api.openai.com/v1/chat/completions",
    TEMPLATE: {
        DIALOG: 'generate.hbs',
        ENHANCE: 'enhance.hbs',
        SHEET: 'generate-sheet.hbs',
        ENHANCESHEET: 'enhance-sheet.hbs'
    }
}

export var isRequesting = false;

export class npcGenGPTLib {

    static async callAI(content) {
        isRequesting = true;

        const requestConfig = this.getRequestConfig(content);

        console.log(`${COSTANTS.LOG_PREFIX} Sending Request`);

        try {
            const response = await fetch(COSTANTS.API_URL, requestConfig);
            const responseData = await response.json();

            if (!response.ok) {
                const errorMsg = (typeof responseData.error.message === 'string') ? responseData.error.message : responseData.error.message.message;
                ui.notifications.error(`${COSTANTS.LOG_PREFIX} ${game.i18n.localize("npc-generator-gpt.status.error")}`);
                throw new Error(`${response.status} | Message: ${errorMsg}`);
            }

            return this.convertGPTData(responseData)
        } catch (error) {
            console.error(error);
        } finally {
            isRequesting = false;
        }
    }

    static getRequestConfig(content) {
        return {
            method: "POST",
            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "temperature": game.settings.get(COSTANTS.MODULE_ID, "temperature"),
                "top_p": game.settings.get(COSTANTS.MODULE_ID, "top_p"),
                "frequency_penalty": game.settings.get(COSTANTS.MODULE_ID, "freq_penality"),
                "presence_penalty": game.settings.get(COSTANTS.MODULE_ID, "pres_penality")
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${game.settings.get(COSTANTS.MODULE_ID, "apiKey")}`
            }
        };
    }

    static convertGPTData(content) {
        const gptContent = content.choices[0].message.content;
        const regex = /```json([\s\S]*?)```/;
        const match = regex.exec(gptContent);
        const errorMsg = `${COSTANTS.LOG_PREFIX} ${game.i18n.localize("npc-generator-gpt.status.error2")}`;

        if (match) {
            const jsonString = match[1].trim();
            try {
                return JSON.parse(jsonString);
            } catch (error) {
                ui.notifications.error(errorMsg);
                console.error(gptContent)
                throw new Error(error.message);
            }
        } else {
            try {
                return JSON.parse(gptContent);
            } catch (error) {
                ui.notifications.error(errorMsg);
                console.error(gptContent)
                throw new Error(error.message);
            }
        }
    }

    static getDialogCategories() {
        return npcGenGPTDataStructure.categoryList.map(category => {
            return { value: category, label: `npc-generator-gpt.dialog.${category}.label` }
        });
    }

    static getDialogOptions(category, random) {
        const list = npcGenGPTDataStructure[category + 'List'];
        const localize = (cat, val) => `npc-generator-gpt.dialog.${cat}.${val}`;
        const options = (typeof list === 'function' ? list(random) : list).map(value => ({
            value,
            label: category === 'cr' ? (Number.isInteger(value) ? value : this.floatToFraction(value)) : localize(category, value),
            translate: typeof value === 'string'
        }));
        if (random) options.unshift({ value: 'random', label: 'npc-generator-gpt.dialog.random', translate: true });
        return options;
    }

    static getSelectedOption(category) {
        let selectedOption = category.find("option:selected");
        if (selectedOption.val() === 'random') {
            const options = category.find("option:not([value='random'])");
            selectedOption = options.eq(Math.floor(Math.random() * options.length));
        }
        const value = (category.attr('id') === 'race') ? this.getRaceFromSubrace(selectedOption.val()) : selectedOption.val();
        const label = selectedOption.text();
        return { value, label };
    }

    static getRaceFromSubrace(npcRace) {
        if (npcRace.includes('-')) npcRace = npcRace.split('-')[0];
        return npcRace
    }

    static async getTemplateStructure(template, data) {
        try {
            const path = `modules/${COSTANTS.MODULE_ID}/templates/${template}`;
            const renderedTemplate = await renderTemplate(path, data);
            return renderedTemplate
        } catch (error) { console.error(error) }
    }

    static getSettingsPacks() {
        return {
            items: game.settings.get(COSTANTS.MODULE_ID, "itemsComp"),
            spells: game.settings.get(COSTANTS.MODULE_ID, "spellsComp")
        }
    }

    static async addItemstoNpc(npc, pack, items) {
        const itemsArray = [];
        for (let item of items) {
            let itm = await this.getItemfromPack(item, pack);
            if (itm) itemsArray.push(itm);
        }
        await npc.createEmbeddedDocuments("Item", itemsArray, {});
    }

    static getItemfromPack(itemName, packName) {
        const compendium = game.packs.get(packName);
        const itemsRef = this.fuzzySearch(itemName, compendium.index.contents, ['name', 'originalName']);
        if (itemsRef.length > 0) {
            const itemDoc = itemsRef[0].item;
            return compendium.getDocument(itemDoc._id);
        }
    }

    static fuzzySearch(query, array, keys) {
        const threshold = game.settings.get(COSTANTS.MODULE_ID, "fuzzyThreshold");
        const fuse = new Fuse(array, { keys: keys, threshold: threshold });
        return fuse.search(query)
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static floatToFraction(float) {
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const g = gcd(Math.round(float * 1000), 1000);
        return `${Math.round(float * 1000) / g}/${1000 / g}`;
    }

    static getRandomFromPool(pool, max) {
        const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
        return shuffledPool.slice(0, max);
    }

    static getAbilityMod(ability) {
        return Math.floor((ability - 10) / 2)
    }

    static getNpcAC(npcCR) {
        if (npcCR == 0) return this.getRandomInt(10, 13);
        if (npcCR <= 3) return 13;
        if (npcCR <= 7) return 15;
        if (npcCR <= 9) return 16;
        if (npcCR <= 12) return 17;
        if (npcCR <= 16) return 18;
        return 19;
    }

    static getNpcCurrency(npcCR) {
        const mult = (npcCR < 1) ? 10 : (npcCR * 100);
        let coins = npcGenGPTLib.rollDice(mult, 10);

        return {
            pp: Math.floor(coins / 1000),
            gp: Math.floor((coins %= 1000) / 100),
            ep: Math.floor((coins %= 100) / 50),
            sp: Math.floor((coins %= 50) / 10),
            cp: coins % 10
        };
    }

    static getNpcHp(npcCR, npcCon, npcSize) {
        const avgHp = this.getAverageHP(npcCR);
        const sizeDice = npcGenGPTDataStructure.hpDice[npcSize];
        const npcConMod = this.getAbilityMod(npcCon);
        const npcHpFormula = this.getHpDicesFormula(avgHp, sizeDice, npcConMod);
        let curHp = this.rollFormula(npcHpFormula);
        if (curHp < 1) curHp = 1;
        return { value: curHp, max: curHp, formula: npcHpFormula }
    }

    static getAverageHP(npcCR) {
        let maxHp, difHp;

        if (npcCR == 0) {
            difHp = 5;
            maxHp = 6;
        } else if (npcCR == 0.125) {
            difHp = 28;
            maxHp = 35;
        } else if (npcCR == 0.25) {
            difHp = 13;
            maxHp = 49;
        } else if (npcCR == 0.5) {
            difHp = 20;
            maxHp = 70;
        } else if (npcCR <= 19) {
            difHp = 14;
            maxHp = 70 + 15 * npcCR;
        } else {
            difHp = 44;
            maxHp = 400 + 45 * (npcCR - 20);
        }

        return this.getRandomInt(maxHp - difHp, maxHp);
    }

    static getHpDicesFormula(avgHp, npcSizeDice, npcConMod) {
        const diceMod = npcSizeDice / 2 + 0.5;
        let dicesCnt = Math.floor(avgHp / diceMod);
        if (dicesCnt < 1) dicesCnt = 1;
        return `${dicesCnt}d${npcSizeDice} + ${dicesCnt * npcConMod}`;
    }

    static getNpcAbilities(profAbilities) {
        const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const npcAbilities = {};
        for (const ability of abilities) {
            npcAbilities[ability] = {
                value: npcGenGPTLib.roll4d6DropLowest(),
                proficient: profAbilities.includes(ability) ? 1 : 0
            };
        }
        return npcAbilities
    }

    static getProficentAbilities(npcAbilities) {
        const profAbilities = [];
        for (const key in npcAbilities) {
            if (npcAbilities[key].proficient === 1) {
                profAbilities.push(key);
            }
        }
        return profAbilities
    }

    static scaleAbilities(npcAbilities, npcCR) {
        const npcScaledAbilities = JSON.parse(JSON.stringify(npcAbilities));
        const extraPoints = Math.floor(npcCR / 2);
        const profPoints = Math.floor(extraPoints * 0.7);
        const profAbilities = Object.keys(npcScaledAbilities).filter(key => npcScaledAbilities[key].proficient >= 1);
        for (const key of profAbilities) {
            npcScaledAbilities[key].value += Math.floor(profPoints / profAbilities.length);
        }
        const nonProfKeys = Object.keys(npcScaledAbilities).filter(key => !profAbilities.includes(key));
        for (let i = 0; i < extraPoints - profPoints; i++) {
            const randomKey = nonProfKeys[Math.floor(Math.random() * nonProfKeys.length)];
            npcScaledAbilities[randomKey].value += 1;
        }
        return npcScaledAbilities
    }

    static convertToMeters(data) {
        let result = {};
        for (let key in data) result[key] = data[key] * 0.3;
        return result;
    }

    static getSkillAbility(npcSkill) {
        const skillAbilities = npcGenGPTDataStructure.skillAbilities;
        for (const key in skillAbilities) {
            if (skillAbilities[key].includes(npcSkill)) return key
        }
    }

    static roll4d6DropLowest() {
        const rolls = this.rollDice(4, 6, true);
        rolls.sort((a, b) => a - b);
        rolls.shift();
        return rolls.reduce((a, b) => a + b, 0);
    }

    static rollDice(throws, diceFaces, isArray = false) {
        let results = [];
        for (let i = 0; i < throws; i++) {
            results.push(Math.floor(Math.random() * diceFaces) + 1);
        }

        if (isArray) {
            return results;
        } else {
            return results.reduce((sum, current) => sum + current, 0);
        }
    }

    static rollFormula(formula, returnArray = false) {
        const roll = new Roll(formula).evaluate({ async: false });
        if (!returnArray) return roll.total
        else return roll.dice[0].results
    }
}
