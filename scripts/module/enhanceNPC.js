import { COSTANTS } from "./lib.js";

export class npcGenGPTEnhanceNPC {
    constructor() {
        this._notYet();
    }

    _notYet() {
        new Dialog({
            title: 'NPC Generator (GPT) - Enhance NPC',
            content: 'Feature not implemented yet!',
            buttons: {},
            default: 'none'
           }, {
            classes: ["npcGenGPT", "dialog"]
           }).render(true);          
    }
}