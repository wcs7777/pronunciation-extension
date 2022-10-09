import {
	utilsTable,
	ipaTable,
	ipaDefaultTable,
	optionsTable,
	audioTable,
} from "../tables.js";
import populateIpa from "../populate-ipa.js";
import populateOptions from "../populate-options.js";
import { isString, normalizeWord } from "../utils.js";
import { playAudioPronunciation } from "../audio.js";
import fallbackIpa from "../fallback-ipa.js";

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
		setMenuItem(await optionsTable.get("accessKey"));
	} catch (error) {
		console.error(error);
	}
	return "Initialization finished";
})()
	.then(console.log)
	.catch(console.error);

async function pronounce(word, tabId) {
	try {
		if (await optionsTable.get("audioEnabled")) {
			playAudio(tabId, word).catch(console.error);
		}
		if (await optionsTable.get("ipaEnabled")) {
			showIpa(tabId, word).catch(console.error);
		}
	} catch (error) {
		console.error(error);
	}
}

async function playAudio(tabId, word) {
	if (!await isTabMuted(tabId)) {
		return playAudioPronunciation(
			word,
			{
				...await optionsTable.get([
					"audioVolume",
					"fetchFileAudioTimeout",
					"fetchScrapAudioTimeout",
					"googleSpeechSpeed",
				]),
				audioTable,
			},
		);
	}
}

async function showIpa(tabId, word) {
	let ipa = await ipaTable.get(word);
	if (!ipa) {
		ipa = await fallbackIpa(word);
		if (ipa) {
			await ipaTable.set(word, ipa);
			console.log(`(ipa saved) ${word}: ${ipa}`);
		}
	}
	if (ipa) {
		await setInjectedScriptVariables(
			tabId,
			{
				...await optionsTable.get([
					"ipaTimeout",
					"popupFontFamily",
					"popupFontSizepx",
					"useWordColors",
				]),
				ipa,
			},
		);
		return injectScript(
			tabId,
			{ file: "../content/bundle/show-ipa.injection.js" },
		);
	}
}

function menuItemOnClick(info, tab) {
	return pronounce(normalizeWord(info.selectionText), tab.id);
}

async function actionOnClicked(tab) {
	const result = await injectScript(
		tab.id,
		{ file: "../content/get-selection-text.injection.js" },
	);
	const selectionText = normalizeWord(result[0]);
	if (selectionText.length > 0) {
		return pronounce(selectionText, tab.id);
	}
}

async function isTabMuted(tabId) {
	return (await browser.tabs.get(tabId)).mutedInfo.muted;
}

function injectScript(tabId, details) {
	return browser.tabs.executeScript(tabId, details);
}

function setInjectedScriptVariables(tabId, obj) {
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
			{ code: `var ${variables.join(", ")};` },
		);
	}
}

async function storageOnChanged(changes) {
	try {
		const accessKey = await optionsTable.get("accessKey");
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
	return browser.menus.create({
		id: "Pronunciation",
		title: `&${accessKey} - Pronunciation`,
		contexts: ["selection"],
		onclick: menuItemOnClick,
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
