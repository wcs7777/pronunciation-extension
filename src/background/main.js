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
import { pronunciationAudio, play } from "../audio.js";
import fallbackIpa from "../fallback-ipa.js";
import { url2audio } from "../utils.js";
import cache from "../cache.js";

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
	browser.alarms.create("cache", { periodInMinutes: 5 });
	if (!browser.alarms.onAlarm.hasListener(onAlarm)) {
		browser.alarms.onAlarm.addListener(onAlarm);
	}
	return "Initialization finished";
})()
	.then(console.log)
	.catch(console.error);

async function pronounce(word, tabId) {
	try {
		const useCache = cache.contains(word);
		if (await optionsTable.get("audioEnabled")) {
			playAudio(word, tabId, useCache)
				.catch(console.error);
		}
		if (await optionsTable.get("ipaEnabled")) {
			showIpa(word, tabId, useCache)
				.catch(console.error);
		}
	} catch (error) {
		console.error(error);
	}
}

async function playAudio(word, tabId, useCache) {
	if (!await isTabMuted(tabId)) {
		if (!useCache) {
			const audio = await pronunciationAudio(
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
			return cache.setAudio(word, audio);
		} else {
			return play(await url2audio(cache.getAudio(word)));
		}
	}
}

async function showIpa(word, tabId, useCache) {
	let ipa = "";
	if (!useCache) {
		ipa = await ipaTable.get(word);
		if (!ipa) {
			ipa = await fallbackIpa(word);
			if (ipa) {
				await ipaTable.set(word, ipa);
				console.log(`(ipa saved) ${word}: ${ipa}`);
			}
		}
	} else {
		ipa = cache.getIpa(word);
	}
	if (ipa) {
		cache.setIpa(word, ipa);
		await setInjectedScriptVariables(
			tabId,
			{
				...await optionsTable.get([
					"ipaTimeout",
					"popupFontFamily",
					"popupFontSizepx",
					"popupCloseOnScroll",
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
		cache.empty();
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

function onAlarm(alarm) {
	if (alarm.name === "cache") {
		const length = cache.length();
		console.log(`cache length: ${length}`);
		if (length > 1000) {
			cache.empty();
		}
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
