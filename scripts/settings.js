Hooks.once('init', () => {
	console.log("NPC Generator (GPT) | Initializing Settings")
	game.npcGenerator = new settingsGeneratorGPT();
});

class settingsGeneratorGPT {
	constructor() {
		this.moduleID = "npc-generator-gpt";
		this._initSettings();
	}

	_initSettings() {
		game.settings.register(this.moduleID, "hideAlignment", {
			name: game.i18n.localize("npc-generator-gpt.settings.hideAlignment.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.hideAlignment.hint"),
			scope: "world",
			config: true,
			default: false,
			type: Boolean
		});
		game.settings.register(this.moduleID, "movementUnits", {
			name: game.i18n.localize("npc-generator-gpt.settings.movementUnits.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.movementUnits.hint"),
			scope: "world",
			config: true,
			default: false,
			type: Boolean
		});
		game.settings.register(this.moduleID, "apiKey", {
			name: game.i18n.localize("npc-generator-gpt.settings.apiKey.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.apiKey.hint"),
			scope: "world",
			config: true,
			default: '',
			type: String
		});
		game.settings.register(this.moduleID, "movementUnits", {
			name: game.i18n.localize("npc-generator-gpt.settings.movementUnits.name"),
			hint: game.i18n.localize("npc-generator-gpt.settings.movementUnits.hint"),
			scope: "world",
			config: true,
			default: false,
			type: Boolean
		});
		game.settings.register(this.moduleID, "temperature", {
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
		game.settings.register(this.moduleID, "top_p", {
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
		game.settings.register(this.moduleID, "freq_penality", {
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
		game.settings.register(this.moduleID, "pres_penality", {
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
}
