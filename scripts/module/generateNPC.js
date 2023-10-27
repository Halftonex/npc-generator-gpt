import { COSTANTS, isRequesting, getTemplateStructure, getRandomInt, getRandomFromPool, roll4d6DropLowest, rollDice, callAI, addItemstoNpc, getSettingsPacks } from "./lib.js";
import { getDialogType, getQueryTemplate, raceStats, subTypeStats, skillAbilities, npcAbilities, crTable } from "./dataStructures.js";

export class npcGenGPTGenerateNPC extends Application {
    constructor() {
        super();
        this.preferences = {};
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: COSTANTS.MODULE_ID,
            title: game.i18n.localize("npc-generator-gpt.dialog.title"),
            template: `modules/${COSTANTS.MODULE_ID}/templates/${COSTANTS.TEMPLATE.DIALOG}`,
            width: 300
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('#type').change(this.changeDialogCategory.bind(this));
        html.find('#npcGenGPT_create-btn').click(this.initGeneration.bind(this));
    }

    changeDialogCategory() {
        const npcType = this.element.find('#type option:selected').val();
        const dialogType = getDialogType();

        const npcTypeMap = {
            "commoner": {
                type: dialogType.commoner,
                label: game.i18n.localize("npc-generator-gpt.dialog.subtype.job"),
            },
            "npc": {
                type: dialogType.npc,
                label: game.i18n.localize("npc-generator-gpt.dialog.subtype.class"),
            }
        };

        const generateOptions = (data) =>
            Object.entries(data).map(([key, value]) => `<option value="${key}">${value}</option>`).join('');

        const { type: subType, label: subTypeLabel } = npcTypeMap[npcType];

        const options = generateOptions(subType.subType);
        let cr = generateOptions(subType.cr.value);

        if (npcType === 'npc') {
            cr += Array.from({ length: subType.cr.max }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
        }

        const element = this.element;
        element.find("label[for='subtype']").text(`${subTypeLabel}:`);
        element.find("#subtype").html(options);
        element.find("#cr").html(cr);
    }

    async initGeneration() {
        if (isRequesting) {
            ui.notifications.warn(`${COSTANTS.LOG_PREFIX} ${game.i18n.localize("npc-generator-gpt.status.wait")}`);
            return;
        }

        this._initPreferences();

        const button = this.element.find('#npcGenGPT_create-btn');
        button.text(game.i18n.localize("npc-generator-gpt.dialog.buttonPending"));

        const content = this._initQuery();
        const responseData = await callAI(content);

        button.text(game.i18n.localize("npc-generator-gpt.dialog.button"));

        if (responseData) {
            this._gptData2preferences(responseData);
            this.createNPC();
        }
    }

    _getDialogOption(dialogSelect) {
        const $dialog = $(dialogSelect);
        let $selectedOption = $dialog.find("option:selected");

        if ($selectedOption.val() === 'random') {
            const allOptions = $dialog.find("option:not([value='random'])");
            const randomIndex = Math.floor(Math.random() * allOptions.length);
            $selectedOption = allOptions.eq(randomIndex);
        }

        return {
            value: $selectedOption.val(),
            label: $selectedOption.text()
        };
    }

    _initPreferences() {
        const type = this.element.find('#type').val();
        this.preferences.type = type;

        this.preferences.details = {
            gender: this._getDialogOption('#gender'),
            race: this._getDialogOption('#race'),
            subtype: this._getDialogOption('#subtype'),
            alignment: this._getDialogOption('#alignment'),
            cr: this._getDialogOption('#cr').value
        };

        const { cr, race, subtype } = this.preferences.details;

        if (type === 'commoner') subtype.value = type;
        this.preferences.currency = this._getNPCCurrency(cr);
        this.preferences.details.type = this._getNPCType(race);
        this.preferences.attributes = this._getNPCAttributes(cr, race.value, subtype.value);
        this.preferences.traits = this._getNPCTraits(subtype.value, race.value);
        this.preferences.abilities = this._getNPCAbilities(subtype.value);
        this.preferences.skills = this._getNPCSkills(subtype.value, race.value);
    }

    _initQuery() {
        const { gender, race, subtype, alignment } = this.preferences.details;
        const options = `${gender.label}, ${race.label}, ${subtype.label}, ${alignment.label}`;
        return getQueryTemplate(options)
    }

    _gptData2preferences(gptData) {
        const { name: gptName, spells, items, appearance, background, roleplaying, readaloud } = gptData;
        this.preferences.name = gptName;
        this.preferences.spells = spells;
        this.preferences.items = items;
        this.preferences.details = {
            ...this.preferences.details,
            biography: {
                appearance: appearance,
                background: background,
                roleplaying: roleplaying,
                readaloud: readaloud
            }
        };
    }

    async createNPC() {
        try {
            const { abilities, attributes, details, name, skills, traits, currency } = this.preferences;
            const fakeAlign = (game.settings.get(COSTANTS.MODULE_ID, "hideAlignment")) ? game.i18n.localize("npc-generator-gpt.sheet.unknown") : details.alignment.label;
            const bioContent = await getTemplateStructure(`modules/${COSTANTS.MODULE_ID}/templates/${COSTANTS.TEMPLATE.SHEET}`, this.preferences);

            console.warn(this.preferences);

            const npc = await Actor.create({ name: name, type: "npc" });
            await npc.update({
                system: {
                    details: {
                        source: "NPC Genrator (GPT)",
                        cr: details.cr,
                        alignment: fakeAlign,
                        race: details.race.label,
                        biography: { value: bioContent },
                        type: details.type
                    },
                    traits: { size: traits.size.value, languages: { value: traits.languages } },
                    abilities: abilities,
                    attributes: {
                        hp: { value: attributes.hp, max: attributes.hp },
                        ac: { value: attributes.ac },
                        movement: attributes.movement,
                        senses: attributes.senses,
                        spellcasting: attributes.spellcasting
                    },
                    skills: skills,
                    currency: currency
                }
            });

            let comp = getSettingsPacks();
            addItemstoNpc(npc, comp.items, this.preferences.items);
            addItemstoNpc(npc, comp.spells, this.preferences.spells);
            
            npc.sheet.render(true);

            this.close();
            ui.notifications.info(`${COSTANTS.LOG_PREFIX} ${game.i18n.format("npc-generator-gpt.status.done", { npcName: name })}`);
        } catch (error) {
            console.error(`${COSTANTS.LOG_PREFIX} Error during NPC creation:`, error);
            ui.notifications.error(`${COSTANTS.LOG_PREFIX} ${game.i18n.localize("npc-generator-gpt.status.error3")}`);
        }
    }

    _getNPCType(npc_race) {
        if (this.preferences.type !== 'monster') {
            return {
                value: "custom",
                custom: npc_race.label
            };
        }
        return {
            value: raceStats[npc_race.value].type,
            subtype: npc_race.label
        };
    }

    _getNPCAttributes(npc_cr, npc_race, npc_subtype) {
        const raceData = raceStats[npc_race];
        const info = { ...crTable[npc_cr] };
        const measureUnits = game.settings.get(COSTANTS.MODULE_ID, "movementUnits") ? 'm' : 'ft';

        info.hp = getRandomInt(info.hp.min, info.hp.max);
        info.ac = (npc_cr === '0') ? getRandomInt(info.ac.min, info.ac.max) : info.ac;

        info.movement = { ...raceData.movement };
        info.senses = { ...raceData.senses };
        info.spellcasting = subTypeStats[npc_subtype]?.spellcasting ?? 'int';

        if (measureUnits === 'm') {
            const convert = obj => {
                for (let key in obj) obj[key] *= 0.3;
                return obj;
            };
            info.movement = { ...convert(info.movement), units: measureUnits };
            info.senses = { ...convert(info.senses), units: measureUnits };
        }

        return info;
    }

    _getNPCTraits(npc_subtype, npc_race) {
        const raceLang = raceStats[npc_race]?.lang || {};
        const subtypeLang = subTypeStats[npc_subtype]?.lang || {};
        const combinedLang = { ...raceLang };

        let nextIndex = Object.keys(combinedLang).length;

        for (const key in subtypeLang) {
            combinedLang[nextIndex] = subtypeLang[key];
            nextIndex++;
        }

        return {
            languages: combinedLang,
            size: raceStats[npc_race].size
        };
    }

    _getNPCAbilities(npc_subtype) {
        const npcStats = subTypeStats[npc_subtype] || {};
        const pool = (npc_subtype === 'commoner')
            ? getRandomFromPool(npcStats.save?.pool, npcStats.save?.max)
            : npcStats.save || {};

        const info = Object.entries(npcAbilities).reduce((acc, [attr, defaultVal]) => {
            acc[attr] = {
                value: roll4d6DropLowest(),
                proficient: pool[attr] ?? 0
            };
            return acc;
        }, {});

        return info;
    }

    _getNPCSkills(npc_subtype, npc_race) {
        const { pool: originalPool, max } = subTypeStats[npc_subtype].skills;

        let pool;
        if (npc_race === 'elf' || npc_race === 'drow') {
            pool = getRandomFromPool(originalPool.filter(skill => skill !== 'prc'), max);
            pool.prc = 1;
        } else {
            pool = getRandomFromPool(originalPool, max);
        }

        return Object.entries(pool).reduce((acc, [skill, value]) => {
            acc[skill] = { value, ability: skillAbilities[skill] };
            return acc;
        }, {});
    }

    _getNPCCurrency(npc_cr) {
        const mult = (npc_cr < 1) ? 10 : (npc_cr * 100);
        let coins = rollDice(10, mult);

        return {
            pp: Math.floor(coins / 1000),
            gp: Math.floor((coins %= 1000) / 100),
            ep: Math.floor((coins %= 100) / 50),
            sp: Math.floor((coins %= 50) / 10),
            cp: coins % 10
        };
    }
}
