import * as st from "../utils/storage-tables.js";
import defaultOptions from "../utils/default-options.js";
import Pronunciation from "../pronunciation/pronunciation.js";
import PronunciationInput from "../pronunciation/pronunciation-input.js";
import { deepEquals, deepMerge, removeMethods } from "../utils/object.js";
import setupOffscreenDocument from "./setup-offscreen-document.js";

if (!chrome.runtime.onInstalled.hasListener(installedCB)) {
	chrome.runtime.onInstalled.addListener(installedCB);
}
if (!chrome.action.onClicked.hasListener(actionOnClickedCB)) {
	chrome.action.onClicked.addListener(actionOnClickedCB);
}
if (!chrome.commands.onCommand.hasListener(onCommand)) {
	chrome.commands.onCommand.addListener(onCommand);
}
if (!chrome.storage.onChanged.hasListener(storageOnChangedCB)) {
	chrome.storage.onChanged.addListener(storageOnChangedCB);
}
if (chrome.contextMenus) {
	if (!chrome.contextMenus.onClicked.hasListener(menuOnClickedCB)) {
		chrome.contextMenus.onClicked.addListener(menuOnClickedCB);
	}
}
if (!chrome.runtime.onMessage.hasListener(onMessage)) {
	chrome.runtime.onMessage.addListener(onMessage);
}

/**
 * @param {string} input
 * @param {number} tabId
 * @param {"menuItem" | "action" | "selection" | "command" | "other"} origin
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
	const position = await chrome.tabs.sendMessage(
		tabId,
		message,
	);
	const pronunciation = new Pronunciation({
		pi,
		position,
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

let setMenuItemPromise = Promise.resolve();

/**
 * @param {string} accessKey
 * @returns {Promise<void>}
 */
async function setMenuItem(accessKey) {
	await setMenuItemPromise;
	if (!chrome.contextMenus) {
		console.log("chrome.contextMenus api not available");
		return;
	}
	if (!accessKey) {
		console.log(`Invalid accessKey: ${accessKey}`);
		return;
	}
	const id = "P";
	setMenuItemPromise = chrome.contextMenus.remove(id)
		.catch(() => {})
		.finally(() => {
			chrome.contextMenus.create({
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
 * @param {chrome.runtime._OnInstalledDetails} details
 * @returns {Promise<void>}
 */
async function installedCB(details) {
	if (details.temporary) {
		console.clear();
		console.log("Cleaning storage due to temporary installation");
		await chrome.storage.local.clear();
	}
	console.log("Startup begin");
	await storeOptions();
	if (details.reason === "install" || details.temporary) {
		const path = "src/options/pages/general.html";
		await chrome.tabs.create({ url: chrome.runtime.getURL(path) });
	} else if (details.reason === "update") {
		const [major, minor, bug] = details
			.previousVersion
			.split(".")
			.map(parseInt);
	}
}

/**
 * @param {chrome.contextMenus.OnClickData} info
 * @param {chrome.tabs.Tab} tab
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
		}
	} catch (error) {
		await saveError("menuOnClicked", error);
	}
}

/**
 * @param {chrome.tabs.Tab} tab
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
		const selectedText = await chrome.tabs.sendMessage(
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
 * @param {string} command
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<void>}
 */
async function onCommand(command, tab) {
	if (command !== "pronounce") {
		console.erro(`Invalid command: ${command}`);
		return;
	}
	try {
		/** @type {ClientMessage} */
		const message = {
			target: "client",
			type: "getSelectedText",
			origin: "command",
		};
		/** @type {string | null} */
		const selectedText = await chrome.tabs.sendMessage(
			tab.id,
			message,
		);
		if (selectedText?.length === 0) {
			console.log("Nothing was selected");
			return;
		}
		await pronounce(selectedText, tab.id, "command");
	} catch (error) {
		await saveError("actionOnClicked", error);
	}
}

/**
 * @param {{ [key: string]: chrome.storage.StorageChange }} changes
 * @param {string} areaName
 * @returns {Promise<void>}
 */
async function storageOnChangedCB(changes, areaName) {
	if (areaName === "local") {
		await localStorageOnChangedCB(changes);
	}
}

/**
 * @param {{ [key: string]: chrome.storage.StorageChange }} changes
 * @returns {Promise<void>}
 */
async function localStorageOnChangedCB(changes) {
	try {
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

/**
 * @param {BackgroundMessage} message
 * @param {chrome.runtime.MessageSender} sender
 * @param {(any) => void} sendResponse
 * @returns {boolean}
 */
function onMessage(message, sender, sendResponse) {
	if (message.target !== "background") {
		return false;
	}
	const actions = {
		"updateTranslatorMindNonce": updateTranslatorMindNonce,
		"pronounce": pronounceFromClient,
	};
	if (!message.type in actions) {
		throw new Error(`Invalid message type: ${message.type}`);
	}
	actions[message.type](message, sender)
		.then(sendResponse)
		.catch(console.error);
	return true;
}

/**
 * @param {BackgroundMessage} message
 * @param {chrome.runtime.MessageSender} _sender
 * @returns {Promise<void>}
 */
async function updateTranslatorMindNonce(message, _sender) {
	if (!message.updateTranslatorMindNonce) {
		throw new Error("Should pass updateTranslatorMindNonce options in message");
	}
	const nonce = message.updateTranslatorMindNonce.nonce;
	const options = await ensureOptions();
	options.ipa.sources.translatorMind.nonce = nonce;
	await st.optionsTable.setMany(options);
}

/**
 * @param {BackgroundMessage} message
 * @param {chrome.runtime.MessageSender} sender
 * @returns {Promise<void>}
 */
async function pronounceFromClient(message, sender) {
	const options = message.pronounce;
	if (!options) {
		throw new Error("Should pass pronounce options in message");
	}
	await pronounce(options.text, sender.tab.id, "selection");
}

(async () => {
	try {
		await setupOffscreenDocument();
	} catch (error) {
		console.error(error);
	}
})();
