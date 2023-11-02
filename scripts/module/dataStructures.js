export class npcGenGPTDataStructure {
    static categoryList = ['type', 'gender', 'race', 'subtype', 'alignment', 'cr'];
    static typeList = ['commoner', 'npc'];
    static genderList = ['male', 'female'];
    static raceList = [
        'dragonborn',
        'dwarf-common', 'dwarf-hill', 'dwarf-mountain',
        'elf-common', 'elf-high', 'elf-wood', 'drow',
        'gnome-common', 'gnome-forest', 'gnome-rock',
        'halfelf',
        'halfling-common', 'halfling-lightfoot', 'halfling-stout',
        'halforc',
        'human',
        'tiefling'
    ];
    static commonerList = [
        'alchemist', 'baker', 'barkeep', 'blacksmith', 'butcher', 'carpenter',
        'cobbler', 'farmer', 'fisherman', 'guard', 'healer', 'hermit', 'hunter',
        'innkeeper', 'merchant', 'messenger', 'miner', 'scribe', 'tailor'
    ];
    static npcList = [
        'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
        'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
    ];
    static alignmentList = ['lg', 'ng', 'cg', 'ln', 'n', 'cn', 'le', 'ne', 'ce'];

    static crList(complete) {
        if (!complete) return [0];
        const cr = [0, 0.125, 0.25, 0.5];
        for (let i = 1; i <= 30; i++) cr.push(i);
        return cr
    }

    static languagesList = [
        "aarakocra", "abyssal", "aquan", "auran", "celestial", "common", 
        "draconic", "druidic", "elvish", "deep", "cant", "giant", "gith",
        "gnoll", "gnomish", "goblin", "halfling", "ignan", "infernal",
        "dwarvish", "orc", "primordial", "sylvan", "undercommon", "terran"
    ];

    static raceData = {
        dragonborn: { movement: { walk: 30 }, size: "med", senses: { darkvision: 0 }, lang: ["common", "draconic"] },
        dwarf: { movement: { walk: 25 }, size: "med", senses: { darkvision: 60 }, lang: ["common", "dwarvish"] },
        elf: { movement: { walk: 30 }, size: "med", senses: { darkvision: 60 }, lang: ["common", "elvish"] },
        drow: { movement: { walk: 30 }, size: "med", senses: { darkvision: 120 }, lang: ["common", "elvish"] },
        gnome: { movement: { walk: 25 }, size: "sm", senses: { darkvision: 60 }, lang: ["common", "gnomish"] },
        halfelf: { movement: { walk: 30 }, size: "med", senses: { darkvision: 60 }, lang: ["common", "elvish"] },
        halfling: { movement: { walk: 25 }, size: "sm", senses: { darkvision: 0 }, lang: ["common", "halfling"] },
        halfling: { movement: { walk: 25 }, size: "sm", senses: { darkvision: 0 }, lang: ["common", "halfling"] },
        halforc: { movement: { walk: 30 }, size: "med", senses: { darkvision: 60 }, lang: ["common", "orc"] },
        human: { movement: { walk: 30 }, size: "med", senses: { darkvision: 0 }, lang: ["common"] },
        tiefling: { movement: { walk: 30 }, size: "med", senses: { darkvision: 60 }, lang: ["common", "infernal"] }
    };

    static subtypeData = {
        commoner: { save: { max: 2, pool: ['str', 'dex', 'int', 'wis', 'con', 'cha'] }, skills: { max: 2, pool: ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inv', 'itm', 'med', 'nat', 'per', 'prc', 'prf', 'rel', 'slt', 'ste', 'sur'] } },
        barbarian: { save: ['str', 'con'], skills: { max: 2, pool: ['ani', 'ath', 'itm', 'nat', 'prc', 'sur'] } },
        bard: { save: ['dex', 'cha'], spellcasting: 'cha', skills: { max: 3, pool: ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inv', 'itm', 'med', 'nat', 'per', 'prc', 'prf', 'rel', 'slt', 'ste', 'sur'] } },
        cleric: { save: ['wis', 'cha'], spellcasting: 'wis', skills: { max: 2, pool: ['his', 'ins', 'med', 'per', 'rel'] } },
        druid: { save: ['int', 'wis'], spellcasting: 'wis', skills: { max: 2, pool: ['ani', 'arc', 'ins', 'med', 'nat', 'prc', 'rel', 'sur'] } },
        fighter: { save: ['str', 'con'], skills: { max: 2, pool: ['acr', 'ani', 'ath', 'itm', 'ins', 'prc', 'sur', 'his'] } },
        monk: { save: ['str', 'dex'], spellcasting: 'wis', skills: { max: 2, pool: ['acr', 'ath', 'ste', 'ins', 'rel', 'his'] } },
        paladin: { save: ['wis', 'cha'], spellcasting: 'cha', skills: { max: 2, pool: ['ath', 'itm', 'ins', 'med', 'per', 'rel'] } },
        ranger: { save: ['str', 'dex'], spellcasting: 'wis', skills: { max: 3, pool: ['ani', 'ath', 'ste', 'inv', 'ins', 'nat', 'prc', 'sur'] } },
        rogue: { save: ['dex', 'int'], lang: ["cant"], skills: { max: 4, pool: ['acr', 'ath', 'ste', 'inv', 'dec', 'itm', 'prf', 'ins', 'prc', 'per', 'slt'] } },
        sorcerer: { save: ['con', 'cha'], spellcasting: 'cha', skills: { max: 2, pool: ['arc', 'dec', 'itm', 'ins', 'per', 'rel'] } },
        warlock: { save: ['wis', 'cha'], spellcasting: 'cha', skills: { max: 2, pool: ['arc', 'inv', 'dec', 'itm', 'nat', 'rel', 'his'] } },
        wizard: { save: ['int', 'wis'], spellcasting: 'int', skills: { max: 2, pool: ['arc', 'inv', 'ins', 'med', 'rel', 'his'] } }
    };

    static skillAbilities = {
        dex: ['acr', 'slt', 'ste'],
        int: ['arc', 'his', 'inv', 'nat', 'rel'],
        wis: ['ani', 'ins', 'med', 'prc', 'sur'],
        cha: ['dec', 'itm', 'per', 'prf']
    };

    static hpDice = { tiny: 4, sm: 6, med: 8, lg: 10, huge: 12, grg: 20 };

    static getGenerateQueryTemplate(options) { 
        return `${game.i18n.format("npc-generator-gpt.query.generate", { userQuery: options })}\n{
            "name": "${game.i18n.localize("npc-generator-gpt.query.name")}",
            "background": "${game.i18n.localize("npc-generator-gpt.query.background")}",
            "appearance": "${game.i18n.localize("npc-generator-gpt.query.appearance")}",
            "roleplaying": "${game.i18n.localize("npc-generator-gpt.query.roleplaying")}",
            "readaloud": "${game.i18n.localize("npc-generator-gpt.query.readaloud")}",
            "items": "${game.i18n.localize("npc-generator-gpt.query.equip")} (array)",
            "spells": "${game.i18n.localize("npc-generator-gpt.query.spells")} (array)",
        }`
    }

    static getEnhanceQueryTemplate(options) { 
        return `${game.i18n.format("npc-generator-gpt.query.enhance", { userQuery: options })}\n{
            "background": "${game.i18n.localize("npc-generator-gpt.query.background")}",
            "appearance": "${game.i18n.localize("npc-generator-gpt.query.appearance")}",
            "roleplaying": "${game.i18n.localize("npc-generator-gpt.query.roleplaying")}",
            "readaloud": "${game.i18n.localize("npc-generator-gpt.query.readaloud")}"
        }`
    }
}
