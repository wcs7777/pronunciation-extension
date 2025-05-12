import * as as from "../pronunciation/audio-source/sources.js";
import * as is from "../pronunciation/ipa-source/sources.js";
import * as st from "../utils/storage-tables.js";
import defaultOptions from "../utils/default-options.js";
import Pronunciation from "../pronunciation/pronunciation.js";
import PronunciationInput from "../pronunciation/pronunciation-input.js";
import { deepEquals, deepMerge, removeMethods } from "../utils/object.js";
import { migrateToV3, migrateToV3_2_0 } from "./migrations.js";

const isTemporary = true;

if (!browser.runtime.onInstalled.hasListener(installedCB)) {
	browser.runtime.onInstalled.addListener(installedCB);
}
if (!browser.action.onClicked.hasListener(actionOnClickedCB)) {
	browser.action.onClicked.addListener(actionOnClickedCB);
}
if (!browser.storage.onChanged.hasListener(storageOnChangedCB)) {
	browser.storage.onChanged.addListener(storageOnChangedCB);
}
if (browser.menus) {
	if (!browser.menus.onClicked.hasListener(menuOnClickedCB)) {
		browser.menus.onClicked.addListener(menuOnClickedCB);
	}
}

startup().catch(console.error);

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
 * @returns {Promise<void>}
 */
async function startup() {
	try {
		if (isTemporary) {
			console.clear();
			console.log("Cleaning storage due to temporary installation");
			await browser.storage.local.clear();
		}
		console.log("Startup begin");
		/**
		 * @type {Options}
		 */
		const currentOptions = await st.optionsTable.getAll();
		// allow new options settings without break change
		/**
		 * @type {Options}
		 */
		const mergedOptions = deepMerge(
			defaultOptions,
			currentOptions,
			true,
		);
		await st.optionsTable.setMany(mergedOptions);
		st.optionsCache.setMany(mergedOptions);
		await setMenuItem(mergedOptions.accessKey);
		if (!currentOptions.ipa || !currentOptions.audio) {
			const path = "src/options/pages/general.html";
			await browser.tabs.create({ url: browser.runtime.getURL(path) });
		}
		console.log({ mergedOptions });
		console.log("Startup end");
	} catch (error) {
		await saveError("startup", error);
	}
}

/**
 * @param {string} input
 * @param {number} tabId
 * @param {"menuItem" | "action" | "other"} origin
 * @returns {Promise<void>}
 */
async function pronounce(input, tabId, origin) {
	const options = await ensureOptions();
	const pi = new PronunciationInput(input, options.allowText);
	const pronunciation = new Pronunciation({
		pi,
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
 * @param {string} accessKey
 * @returns {Promise<void>}
 */
async function setMenuItem(accessKey) {
	if (!browser.menus) {
		console.log("browser.menus api not available");
		return;
	}
	const id = "P";
	try {
		await browser.menus.remove(id);
	} catch {
	} finally {
		browser.menus.create({
			id,
			title: `&${accessKey} - How2Say`,
			contexts: ["selection"],
			enabled: true,
			type: "normal",
			visible: true,
		});
	}
}

/**
 * @returns {Promise<Options>}
 */
async function ensureOptions() {
	/**
	 * @type {Options}
	 */
	let options = st.optionsCache.getAll();
	if (!options.ipa || !options.audio) {
		options = await st.optionsTable.getAll();
		st.optionsCache.setMany(options);
	}
	if (!options.ipa || !options.audio) {
		await startup();
		options = st.optionsCache.getAll();
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
	if (details.reason === "update") {
		const [major, minor, bug] = details
			.previousVersion
			.split(".")
			.map(parseInt);
		if (major < 3) { // break change
			await migrateToV3();
		}
		if (major === 3 && minor < 2) {
			await migrateToV3_2_0();
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
		const selectedText = (info.selectionText ?? "").trim();
		if (selectedText.length == 0) {
			console.log("Nothing was selected");
			return;
		}
		await pronounce(selectedText, tab.id, "menuItem");
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
		/**
		 * @type {ClientMessage}
		 */
		const message = {
			target: "client",
			type: "getSelectedText",
			origin: "action",
		};
		/**
		 * @type {string | null}
		 */
		const selectedText = await browser.tabs.sendMessage(
			tab.id,
			message,
		);
		if (selectedText?.length == 0) {
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
			if (optionsChange.oldValue) {
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
		}
	} catch (error) {
		await saveError("storageOnChanged", error);
	}
}
