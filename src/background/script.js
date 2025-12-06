import * as as from "../pronunciation/audio-source/sources.js";
import * as is from "../pronunciation/ipa-source/sources.js";
import * as st from "../utils/storage-tables.js";
import defaultOptions from "../utils/default-options.js";
import Pronunciation from "../pronunciation/pronunciation.js";
import PronunciationInput from "../pronunciation/pronunciation-input.js";
import { deepEquals, deepMerge, removeMethods } from "../utils/object.js";
import {
	migrateToV3,
	migrateToV3_2_0,
	migrateToV3_5_0,
} from "./migrations.js";

if (!browser.runtime.onInstalled.hasListener(installedCB)) {
	browser.runtime.onInstalled.addListener(installedCB);
}
if (!browser.browserAction.onClicked.hasListener(actionOnClickedCB)) {
	browser.browserAction.onClicked.addListener(actionOnClickedCB);
}
if (!browser.storage.onChanged.hasListener(storageOnChangedCB)) {
	browser.storage.onChanged.addListener(storageOnChangedCB);
}
if (browser.menus) {
	if (!browser.menus.onClicked.hasListener(menuOnClickedCB)) {
		browser.menus.onClicked.addListener(menuOnClickedCB);
	}
	browser.menus.create({
		id: "A",
		title: `How2Say - Show audio player`,
		contexts: ["tab"],
		enabled: true,
		type: "normal",
		visible: true,
	});
}

/**
 * @type{IpaSource[]}
 */
const ipaSources = [
	is.ISAntvaset,
	is.ISCambridge,
	is.ISOxford,
	is.ISUnalengua,
];
/**
 * @type{AudioSource[]}
 */
const audioSources = [
	as.ASAmazonPolly,
	as.ASCambridge,
	as.ASDeepSeek,
	as.ASElevenLabs,
	as.ASGoogleSpeech,
	as.ASGstatic,
	as.ASLinguee,
	as.ASOpenAi,
	as.ASOxford,
	as.ASPlayHt,
	as.ASResponsiveVoice,
	as.ASSpeechify,
	as.ASUnrealSpeech,
];

/**
 * @param {string} input
 * @param {number} tabId
 * @param {"menuItem" | "action" | "other"} origin
 * @returns {Promise<void>}
 */
async function pronounce(input, tabId, origin) {
	const options = await ensureOptions();
	const pi = new PronunciationInput(input, options.allowText);
	/** @type {ClientMessage} */
	const message = {
		target: "client",
		type: "getIpaPosition",
		origin,
		getIpaPosition: {
			fontSize: options.ipa.style.font.size,
			optionPosition: options.ipa.position,
		},
	};
	/** @type {PopupPosition} */
	const position = await browser.tabs.sendMessage(
		tabId,
		message,
	)
	const pronunciation = new Pronunciation({
		pi,
		position,
		ipaSources,
		audioSources,
		options,
		audioTable: st.audioTable,
		audioCache: st.audioCache,
		ipaTable: st.ipaTable,
		ipaCache: st.ipaCache,
		audioTextTable: st.audioTextTable,
		audioTextCache: st.audioTextCache,
		ipaTextCache: st.ipaTextCache,
		sourceLastErrorTable: st.sourceLastErrorTable,
		tabId,
		origin,
	});
	try {
		await pronunciation.pronounce();
	} catch (error) {
		await saveError("pronunciation", error);
	}
}

/**
 * @returns {Promise<Options>}
 */
async function storeOptions() {
	try {
		// allow new options settings without break change
		/** @type {Options} */
		const mergedOptions = deepMerge(
			defaultOptions,
			await st.optionsTable.getAll(),
			true,
		);
		await st.optionsTable.setMany(mergedOptions);
		st.optionsCache.setMany(mergedOptions);
		await setMenuItem(mergedOptions.accessKey);
		return mergedOptions;
	} catch (error) {
		await saveError("storeOptions", error);
	}
}

/**
 * @param {string} accessKey
 * @returns {Promise<void>}
 */
async function setMenuItem(accessKey) {
	if (!browser.menus) {
		console.log("browser.menus api not available");
		return;
	}
	if (!accessKey) {
		console.log(`Invalid accessKey: ${accessKey}`);
		return;
	}
	const id = "P";
	return browser.menus.remove(id)
		.catch(() => {})
		.finally(() => {
			browser.menus.create({
				id,
				title: `&${accessKey} - How2Say`,
				contexts: ["selection"],
				enabled: true,
				type: "normal",
				visible: true,
			});
		});
}

/**
 * @returns {Promise<Options>}
 */
async function ensureOptions() {
	/** @type {Options} */
	let options = st.optionsCache.getAll();
	if (!options.ipa || !options.audio) {
		options = await st.optionsTable.getAll();
		st.optionsCache.setMany(options);
	}
	if (!options.ipa || !options.audio) {
		options = await storeOptions();
	}
	return options;
}

/**
 * @param {string} context
 * @param {any} error
 * @returns {Promise<void>}
 */
async function saveError(context, error) {
	console.error(error);
	const errorObj = removeMethods(error);
	if (error?.error) {
		errorObj['error'] = removeMethods(error.error);
	}
	st.errorsTable.set(new Date().toISOString(), {
		context,
		error: errorObj,
	});
}

/**
 * @param {browser.runtime._OnInstalledDetails} details
 * @returns {Promise<void>}
 */
async function installedCB(details) {
	if (details.temporary) {
		console.clear();
		console.log("Cleaning storage due to temporary installation");
	}
	console.log("Startup begin");
	await storeOptions();
	if (details.reason === "install") {
		const path = "src/options/pages/general.html";
		await browser.tabs.create({ url: browser.runtime.getURL(path) });
	} else if (details.reason === "update") {
		const [major, minor, bug] = details
			.previousVersion
			.split(".")
			.map(parseInt);
		if (major < 3) { // break change
			await migrateToV3();
		}
		if (major === 3) {
			if (minor < 2) {
				await migrateToV3_2_0();
			}
			if (minor < 5) {
				await migrateToV3_5_0();
			}
		}
	}
}

/**
 * @param {browser.menus.OnClickData} info
 * @param {browser.tabs.Tab} tab
 * @returns {Promise<void>}
 */
async function menuOnClickedCB(info, tab) {
	try {
		if (info.menuItemId === "P") {
			const selectedText = (info.selectionText ?? "").trim();
			if (selectedText.length == 0) {
				console.log("Nothing was selected");
				return;
			}
			await pronounce(selectedText, tab.id, "menuItem");
		} else if (info.menuItemId === "A") {
			console.log("Show audio player");
		}
	} catch (error) {
		await saveError("menuOnClicked", error);
	}
}

/**
 * @param {browser.tabs.Tab} tab
 * @returns {Promise<void>}
 */
async function actionOnClickedCB(tab) {
	try {
		/** @type {ClientMessage} */
		const message = {
			target: "client",
			type: "getSelectedText",
			origin: "action",
		};
		/** @type {string | null} */
		const selectedText = await browser.tabs.sendMessage(
			tab.id,
			message,
		);
		if (selectedText?.length === 0) {
			console.log("Nothing was selected");
			return;
		}
		await pronounce(selectedText, tab.id, "action");
	} catch (error) {
		await saveError("actionOnClicked", error);
	}
}

/**
 * @param {{ [key: string]: browser.storage.StorageChange }} changes
 * @param {string} areaName
 * @returns {Promise<void>}
 */
async function storageOnChangedCB(changes, areaName) {
	try {
		if (areaName !== "local") {
			return;
		}
		const changesKeys = Object.keys(changes);
		const ipaKeys = changesKeys.filter(
			k => k.startsWith(st.ipaTable.name),
		);
		const audioKeys = changesKeys.filter(
			k => k.startsWith(st.audioTable.name),
		);
		const optionsKeys = changesKeys.filter(
			k => k.startsWith(st.optionsTable.name),
		);
		if (ipaKeys.length > 0) {
			console.log(`Cleaning ${st.ipaCache.name} cache`);
			st.ipaCache.clear();
		}
		if (audioKeys.length > 0) {
			console.log(`Cleaning ${st.audioCache.name} cache`);
			st.audioCache.clear();
		}
		if (optionsKeys.length > 0) {
			console.log(`Cleaning ${st.optionsCache.name} cache`);
			st.optionsCache.clear();
			console.log(`Resetting ${st.optionsCache.name} cache`);
			st.optionsCache.setMany(await st.optionsTable.getAll());
			// only works if TableByParentKey
			const optionsChange = changes[optionsKeys];
			const oldAccessKey = optionsChange?.oldValue?.accessKey;
			const newAccessKey = optionsChange?.newValue?.accessKey;
			if (oldAccessKey !== newAccessKey) {
				await setMenuItem(newAccessKey);
			}
			const oldIpa = optionsChange?.oldValue?.ipa;
			const newIpa = optionsChange?.newValue?.ipa;
			if (!deepEquals(oldIpa, newIpa)) {
				console.log(`Cleaning ${st.ipaTextCache.name} cache`);
				st.ipaTextCache.clear();
			}
			const oldAudio = optionsChange?.oldValue?.audio;
			const newAudio = optionsChange?.newValue?.audio;
			if (!deepEquals(oldAudio, newAudio)) {
				console.log(`Cleaning ${st.audioTextCache.name} cache`);
				st.audioTextCache.clear();
			}
		}
	} catch (error) {
		await saveError("storageOnChanged", error);
	}
}
