import { getAudio, playAudio } from "../audio.js";
import Cache from "../cache.js";
import fallbackIpa from "../fallback-ipa.js";
import populateIpa from "../populate-ipa.js";
import populateOptions from "../populate-options.js";
import {
	audioTable,
	ipaDefaultTable,
	ipaTable,
	optionsTable,
	utilsTable
} from "../tables.js";
import { isString, normalizeWord } from "../utils.js";

let cache = undefined;

(async () => {
	try {
		populate(
			ipaTable,
			populateIpa,
			async () => ipaDefaultTable.set(await ipaTable.getAll()),
		)
			.then(console.log)
			.catch(console.error);
		await populate(optionsTable, populateOptions)
			.then(console.log)
			.catch(console.error);
		if (!browser.browserAction.onClicked.hasListener(actionOnClicked)) {
			browser.browserAction.onClicked.addListener(actionOnClicked);
		}
		if (!browser.storage.onChanged.hasListener(storageOnChanged)) {
			browser.storage.onChanged.addListener(storageOnChanged);
		}
		await resetCache();
		setMenuItem(cache.getOptions("accessKey"));
	} catch (error) {
		console.error(error);
	}
	return "Initialization finished";
})()
	.then(console.log)
	.catch(console.error);

async function pronounce({ word, cache, tabId, frameId=0 }={}) {
	try {
		if (cache.getOptions("audioEnabled")) {
			pronounceWithAudio(word, tabId).catch(console.error);
		}
		if (cache.getOptions("ipaEnabled")) {
			pronounceWithIpa(word, tabId, frameId).catch(console.error);
		}
	} catch (error) {
		console.error(error);
	}
}

async function pronounceWithAudio(word, tabId) {
	if (!await isTabMuted(tabId)) {
		if (!cache.getAudio(word)) {
			cache.addAudio(
				word,
				await getAudio(
					word,
					{
						audioTable,
						...cache.getOptions([
							"audioFetchFileTimeout",
							"audioFetchScrapTimeout",
							"audioGoogleSpeechSpeed",
						]),
					},
				),
			);
		}
		const audio = cache.getAudio(word);
		if (audio) {
			await playAudio(
				audio,
				cache.getOptions("audioVolume"),
				cache.getOptions("audioPlaybackRate"),
			);
		}
	}
}

async function pronounceWithIpa(word, tabId, frameId=0) {
	if (!cache.getIpa(word)) {
		let ipa = await ipaTable.get(word);
		if (!ipa) {
			ipa = await fallbackIpa(word);
			if (ipa) {
				await ipaTable.set(word, ipa);
				console.log(`(ipa saved) ${word}: ${ipa}`);
			}
		}
		cache.addIpa(word, ipa);
	}
	const ipa = cache.getIpa(word);
	if (ipa) {
		await setInjectedScriptVariables(
			{
				ipa,
				...cache.getOptions([
					"ipaTimeout",
					"ipaFontFamily",
					"ipaFontSizePx",
					"ipaCloseShortcut",
					"ipaCloseOnScroll",
					"ipaUseContextColors",
				]),
			},
			tabId,
			frameId,
		);
		injectScript(
			tabId,
			{
				frameId,
				file: "../content/bundle/show-ipa.injection.js",
			},
		);
	}
}

function menuItemOnClick(info, tab) {
	return pronounce({
		cache,
		word: normalizeWord(info.selectionText),
		tabId: tab.id,
		frameId: info.frameId,
	});
}

async function actionOnClicked(tab) {
	const result = await injectScript(
		tab.id,
		{ file: "../content/get-selection-text.injection.js" },
	);
	const selectionText = normalizeWord(result[0]);
	if (selectionText.length > 0) {
		return pronounce({
			cache,
			word: selectionText,
			tabId: tab.id,
		});
	}
}

async function isTabMuted(tabId) {
	return (await browser.tabs.get(tabId)).mutedInfo.muted;
}

function injectScript(tabId, details) {
	return browser.tabs.executeScript(tabId, details);
}

function setInjectedScriptVariables(obj, tabId, frameId=0) {
	const variables = Object
		.entries(obj)
		.map(([variable, value]) => {
			return (
				isString(value) ?
				`${variable} = "${value}"` :
				`${variable} = ${value}`
			);
		});
	if (variables.length > 0) {
		return injectScript(
			tabId,
			{
				frameId,
				code: `var ${variables.join(", ")};`,
			},
		);
	}
}

async function resetCache() {
	cache = new Cache();
	cache.setOptions(await optionsTable.getAll());
}

async function storageOnChanged(changes) {
	try {
		await resetCache();
		const accessKey = cache.getOptions("accessKey");
		if (
			changes[optionsTable.name] &&
			await utilsTable.get("currentAccessKey") !== accessKey
		) {
			await setMenuItem(accessKey);
		}
	} catch (error) {
		console.error(error);
	}
}

async function setMenuItem(accessKey) {
	await browser.menus.removeAll();
	await utilsTable.set("currentAccessKey", accessKey);
	if (!browser.menus.onClicked.hasListener(menuItemOnClick)) {
		browser.menus.onClicked.addListener(menuItemOnClick);
	}
	return browser.menus.create({
		id: "Pronunciation",
		title: `&${accessKey} - Pronunciation`,
		contexts: ["selection"],
	});
}

async function populate(table, populateFn, afterPopulateFn) {
	if (!await utilsTable.get(table.name)) {
		await populateFn(table);
		if (afterPopulateFn) {
			await afterPopulateFn();
		}
		await utilsTable.set(table.name, true);
		return `${table.name} populated`;
	} else {
		return `${table.name} is already populated`;
	}
}
