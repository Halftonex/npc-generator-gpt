export function getDialogType() {
    return {
        commoner: {
            subType: {
                random: game.i18n.localize("npc-generator-gpt.dialog.random"),
                alchemist: game.i18n.localize("npc-generator-gpt.dialog.commoner.alchemist"),
                baker: game.i18n.localize("npc-generator-gpt.dialog.commoner.baker"),
                barkeep: game.i18n.localize("npc-generator-gpt.dialog.commoner.barkeep"),
                blacksmith: game.i18n.localize("npc-generator-gpt.dialog.commoner.blacksmith"),
                butcher: game.i18n.localize("npc-generator-gpt.dialog.commoner.butcher"),
                carpenter: game.i18n.localize("npc-generator-gpt.dialog.commoner.carpenter"),
                cobbler: game.i18n.localize("npc-generator-gpt.dialog.commoner.cobbler"),
                farmer: game.i18n.localize("npc-generator-gpt.dialog.commoner.farmer"),
                fisherman: game.i18n.localize("npc-generator-gpt.dialog.commoner.fisherman"),
                guard: game.i18n.localize("npc-generator-gpt.dialog.commoner.guard"),
                healer: game.i18n.localize("npc-generator-gpt.dialog.commoner.healer"),
                hermit: game.i18n.localize("npc-generator-gpt.dialog.commoner.hermit"),
                hunter: game.i18n.localize("npc-generator-gpt.dialog.commoner.hunter"),
                innkeeper: game.i18n.localize("npc-generator-gpt.dialog.commoner.innkeeper"),
                merchant: game.i18n.localize("npc-generator-gpt.dialog.commoner.merchant"),
                messenger: game.i18n.localize("npc-generator-gpt.dialog.commoner.messenger"),
                miner: game.i18n.localize("npc-generator-gpt.dialog.commoner.miner"),
                scribe: game.i18n.localize("npc-generator-gpt.dialog.commoner.scribe"),
                tailor: game.i18n.localize("npc-generator-gpt.dialog.commoner.tailor")
            },
            cr: {
                value: {
                    "0": "0"
                },
                max: 0
            }
        },
        npc: {
            subType: {
                random: game.i18n.localize("npc-generator-gpt.dialog.random"),
                barbarian: game.i18n.localize("npc-generator-gpt.dialog.npc.barbarian"),
                bard: game.i18n.localize("npc-generator-gpt.dialog.npc.bard"),
                cleric: game.i18n.localize("npc-generator-gpt.dialog.npc.cleric"),
                druid: game.i18n.localize("npc-generator-gpt.dialog.npc.druid"),
                fighter: game.i18n.localize("npc-generator-gpt.dialog.npc.fighter"),
                monk: game.i18n.localize("npc-generator-gpt.dialog.npc.monk"),
                paladin: game.i18n.localize("npc-generator-gpt.dialog.npc.paladin"),
                ranger: game.i18n.localize("npc-generator-gpt.dialog.npc.ranger"),
                rogue: game.i18n.localize("npc-generator-gpt.dialog.npc.rogue"),
                sorcerer: game.i18n.localize("npc-generator-gpt.dialog.npc.sorcerer"),
                warlock: game.i18n.localize("npc-generator-gpt.dialog.npc.warlock"),
                wizard: game.i18n.localize("npc-generator-gpt.dialog.npc.wizard")
            },
            cr: {
                value: {
                    random: game.i18n.localize("npc-generator-gpt.dialog.random"),
                    "0.125": "1/8",
                    "0.250": "1/4",
                    "0.500": "1/2"
                },
                max: 30
            }
        }
    }
};

export const preferencesTemplate = {
    name: '',
    abilities: '',
    attributes: '',
    details: '',
    equip: '',
    skills: '',
    spells: '',
    traits: '',
}

export const raceStats = {
    dragonborn: { type: "humanoid", movement: { walk: 30 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 0 }, lang: { 0: "common", 1: "draconic" } },
    dwarf: { type: "humanoid", movement: { walk: 25 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 60 }, lang: { 0: "common", 1: "dwarvish" } },
    elf: { type: "humanoid", movement: { walk: 30 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 60 }, lang: { 0: "common", 1: "elvish" } },
    drow: { type: "humanoid", movement: { walk: 30 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 120 }, lang: { 0: "common", 1: "elvish" } },
    gnome: { type: "humanoid", movement: { walk: 25 }, size: { value: 'sm', label: 'Small' }, senses: { darkvision: 60 }, lang: { 0: "common", 1: "gnomish" } },
    halfelf: { type: "humanoid", movement: { walk: 30 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 60 }, lang: { 0: "common", 1: "elvish" } },
    halfling: { type: "humanoid", movement: { walk: 25 }, size: { value: 'sm', label: 'Small' }, senses: { darkvision: 0 }, lang: { 0: "common", 1: "halfling" } },
    halfling: { type: "humanoid", movement: { walk: 25 }, size: { value: 'sm', label: 'Small' }, senses: { darkvision: 0 }, lang: { 0: "common", 1: "halfling" } },
    halforc: { type: "humanoid", movement: { walk: 30 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 60 }, lang: { 0: "common", 1: "orc" } },
    human: { type: "humanoid", movement: { walk: 30 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 0 }, lang: { 0: "common" } },
    tiefling: { type: "humanoid", movement: { walk: 30 }, size: { value: 'med', label: 'Medium' }, senses: { darkvision: 60 }, lang: { 0: "common", 1: "infernal" } }
};

export const subTypeStats = {
    commoner: { save: { max: 2, pool: ['str', 'dex', 'int', 'wis', 'con', 'cha'] }, skills: { max: 2, pool: ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inv', 'itm', 'med', 'nat', 'per', 'prc', 'prf', 'rel', 'slt', 'ste', 'sur'] } },  
    barbarian: { save: { str: 1, con: 1 }, skills: { max: 2, pool: ['ani', 'ath', 'itm', 'nat', 'prc', 'sur'] } },
    bard: { save: { dex: 1, cha: 1 }, spellcasting: 'cha', skills: { max: 3, pool: ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inv', 'itm', 'med', 'nat', 'per', 'prc', 'prf', 'rel', 'slt', 'ste', 'sur'] } },
    cleric: { save: { wis: 1, cha: 1 }, spellcasting: 'wis', skills: { max: 2, pool: ['his', 'ins', 'med', 'per', 'rel'] } },
    druid: { save: { int: 1, wis: 1 }, spellcasting: 'wis', skills: { max: 2, pool: ['ani', 'arc', 'ins', 'med', 'nat', 'prc', 'rel', 'sur'] } },
    fighter: { save: { str: 1, con: 1 }, skills: { max: 2, pool: ['acr', 'ani', 'ath', 'itm', 'ins', 'prc', 'sur', 'his'] } },
    monk: { save: { str: 1, dex: 1 }, spellcasting: 'wis', skills: { max: 2, pool: ['acr', 'ath', 'ste', 'ins', 'rel', 'his'] } },
    paladin: { save: { wis: 1, cha: 1 }, spellcasting: 'cha', skills: { max: 2, pool: ['ath', 'itm', 'ins', 'med', 'per', 'rel'] } },
    ranger: { save: { str: 1, dex: 1 }, spellcasting: 'wis', skills: { max: 3, pool: ['ani', 'ath', 'ste', 'inv', 'ins', 'nat', 'prc', 'sur'] } },
    rogue: { save: { dex: 1, int: 1 }, lang: { 0: "cant" }, skills: { max: 4, pool: ['acr', 'ath', 'ste', 'inv', 'dec', 'itm', 'prf', 'ins', 'prc', 'per', 'slt'] } },
    sorcerer: { save: { con: 1, cha: 1 }, spellcasting: 'cha', skills: { max: 2, pool: ['arc', 'dec', 'itm', 'ins', 'per', 'rel'] } },
    warlock: { save: { wis: 1, cha: 1 }, spellcasting: 'cha', skills: { max: 2, pool: ['arc', 'inv', 'dec', 'itm', 'nat', 'rel', 'his'] } },
    wizard: { save: { int: 1, wis: 1 }, spellcasting: 'int', skills: { max: 2, pool: ['arc', 'inv', 'ins', 'med', 'rel', 'his'] } }
};

export const skillAbilities = {
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
};

export const npcAbilities = { 
    str: {},
    dex: {},
    con: {},
    int: {},
    wis: {},
    cha: {}
};

export const crTable = {
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

export function getQueryTemplate(options) {
    return `${game.i18n.format("npc-generator-gpt.query.pre", { userQuery: options })}\n{
        "name": "${game.i18n.localize("npc-generator-gpt.query.name")}",
        "background": "${game.i18n.localize("npc-generator-gpt.query.background")}",
        "appearance": "${game.i18n.localize("npc-generator-gpt.query.appearance")}",
        "roleplaying": "${game.i18n.localize("npc-generator-gpt.query.roleplaying")}",
        "readaloud": "${game.i18n.localize("npc-generator-gpt.query.readaloud")}",
        "items": "${game.i18n.localize("npc-generator-gpt.query.equip")} (array)",
        "spells": "${game.i18n.localize("npc-generator-gpt.query.spells")} (array)",
    }`
}
