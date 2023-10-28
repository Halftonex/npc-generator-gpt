import { COSTANTS } from "./lib.js";

export class npcGenGPTSettings {
	constructor() {
		this._initSettings();
	}

	_initSettings() {
		const compList = this._getCompendiumList();

		game.settings.register(COSTANTS.MODULE_ID, "hideAlignment", {
			name: game.i18n.localize("npc-generator-gpt.settings.hideAlignment.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.hideAlignment.hint"),
			scope: "world",
			config: true,
			default: false,
			type: Boolean
		});
		game.settings.register(COSTANTS.MODULE_ID, "movementUnits", {
			name: game.i18n.localize("npc-generator-gpt.settings.movementUnits.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.movementUnits.hint"),
			scope: "world",
			config: true,
			default: false,
			type: Boolean
		});
		game.settings.register(COSTANTS.MODULE_ID, "itemsComp", {
			name: game.i18n.localize("npc-generator-gpt.settings.itemsComp.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.itemsComp.hint"),
			scope: "world",
			config: true,
			default: "dnd5e.items",
			type: String,
			choices: compList
		});
		game.settings.register(COSTANTS.MODULE_ID, "spellsComp", {
			name: game.i18n.localize("npc-generator-gpt.settings.spellsComp.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.spellsComp.hint"),
			scope: "world",
			config: true,
			default: "dnd5e.spells",
			type: String,
			choices: compList
		});
		game.settings.register(COSTANTS.MODULE_ID, "fuzzyThreshold", {
			name: game.i18n.localize("npc-generator-gpt.settings.fuzzyThreshold.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.fuzzyThreshold.hint"),
			scope: "world",
			config: true,
			default: 0.4,
			type: Number,
			range: {
				min: 0,
				max: 1,
				step: 0.1,
			}
		});
		game.settings.register(COSTANTS.MODULE_ID, "apiKey", {
			name: game.i18n.localize("npc-generator-gpt.settings.apiKey.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.apiKey.hint"),
			scope: "client",
			config: true,
			default: '',
			type: String
		});
		game.settings.register(COSTANTS.MODULE_ID, "temperature", {
			name: game.i18n.localize("npc-generator-gpt.settings.temperature.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.temperature.hint"),
			scope: "world",
			config: true,
			default: 1,
			type: Number,
			range: {
				min: 0,
				max: 2,
				step: 0.01,
			}
		});
		game.settings.register(COSTANTS.MODULE_ID, "top_p", {
    		name: game.i18n.localize("npc-generator-gpt.settings.top_p.name"),
    		hint: game.i18n.localize("npc-generator-gpt.settings.top_p.hint"),
    		scope: "world",
    		config: true,
			default: 1,
    		type: Number,
			range: {
				min: 0,
				max: 1,
				step: 0.01,
			}
		});
		game.settings.register(COSTANTS.MODULE_ID, "freq_penality", {
    		name: game.i18n.localize("npc-generator-gpt.settings.freq_penality.name"),
    		hint: game.i18n.localize("npc-generator-gpt.settings.freq_penality.hint"),
    		scope: "world",
    		config: true,
			default: 0,
    		type: Number,
			range: {
				min: 0,
				max: 2,
				step: 0.01,
			}
		});
		game.settings.register(COSTANTS.MODULE_ID, "pres_penality", {
    		name: game.i18n.localize("npc-generator-gpt.settings.pres_penality.name"),
    		hint: game.i18n.localize("npc-generator-gpt.settings.pres_penality.hint"),
    		scope: "world",
    		config: true,
			default: 0,
    		type: Number,
			range: {
				min: 0,
				max: 2,
				step: 0.01,
			}
		});
	}

	_getCompendiumList() {
		const packs = {};
		game.packs.forEach(comp => {
			const { packageType, packageName, id, label } = comp.metadata;
			let source = '';
			
			switch (packageType) {
				case 'system':
					source = game.i18n.localize("npc-generator-gpt.settings.systemSource");
					break;
				case 'world':
					source = game.world.title;
					break;
				case 'module':
					const module = game.modules.get(packageName);
					source = module ? module.data.title : '';
					break;
			}
	
			packs[id] = `${label} [${source}]`;
		});
	
		return packs;
	}
	
}
