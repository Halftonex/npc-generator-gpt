import { Fuse } from "../lib/fuse.mjs"

export const COSTANTS = {
    MODULE_ID: "npc-generator-gpt",
    LOG_PREFIX: "NPC Generator (GPT) |",
    API_URL: {
        OPENAI: "https://api.openai.com/v1/chat/completions",
        BETTER: "https://free.churchless.tech/v1/chat/completions"
    },
    TEMPLATE: {
        DIALOG: 'generate.hbs',
        SHEET: 'sheet.hbs'
    }
}

export var isRequesting = false;

export async function callAI(content) {
    isRequesting = true;

    const requestConfig = getRequestConfig(content);
    const apiURL = (game.settings.get(COSTANTS.MODULE_ID, "apiKey")) ? COSTANTS.API_URL.OPENAI : COSTANTS.API_URL.BETTER;

    console.log(`${COSTANTS.LOG_PREFIX} Sending Request`);

    try {
        const response = await fetch(apiURL, requestConfig);
        const responseData = await response.json();

        if (!response.ok) {
            const errorMsg = (typeof responseData.error.message === 'string') ? responseData.error.message : responseData.error.message.message;
            ui.notifications.error(`${COSTANTS.LOG_PREFIX} ${game.i18n.localize("npc-generator-gpt.status.error")}`);
            throw new Error(`${response.status} | Message: ${errorMsg}`);
        }

        return convertGPTData(responseData)
    } catch (error) {
        console.error(error);
    } finally {
        isRequesting = false;
    }
}

function getRequestConfig(content) {
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

function convertGPTData(content) {
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

export async function getTemplateStructure(path, data) {
    try {
        const template = await renderTemplate(path, data);
        return template
    } catch (error) { console.error(error) }
}

export function getSettingsPacks() {
    return {
        items: game.settings.get(COSTANTS.MODULE_ID, "itemsComp"),
        spells: game.settings.get(COSTANTS.MODULE_ID, "spellsComp")
    }
}

export async function addItemstoNpc(npc, pack, items) {
    const compendium = game.packs.get(pack);
    const threshold = game.settings.get(COSTANTS.MODULE_ID, "fuzzyThreshold");
    const fuse = new Fuse(compendium.index.contents, { keys: ['name', 'originalName'], threshold: threshold });
    const itemsArray = [];

    for (let item of items) {
        const itemsRef = fuse.search(item);
        
        if (itemsRef.length > 0) {
            const itemDoc = itemsRef[0].item;
            const itemObj = await compendium.getDocument(itemDoc._id);
            itemsArray.push(itemObj);
        }
    }

    await npc.createEmbeddedDocuments("Item", itemsArray, {});
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFromPool(pool, max) {
    let shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffledPool.slice(0, max);

    return Object.fromEntries(selected.map(el => [el, 1]));
}

export function roll4d6DropLowest() {
    const rolls = rollDice(6, 4, true);
    rolls.sort((a, b) => a - b);
    rolls.shift();
    return rolls.reduce((a, b) => a + b, 0);
}

export function rollDice(diceFaces, throws, isArray = false) {
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
