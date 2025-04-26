import { byId, downloadObject } from "../../utils/element.js";
import {
	addonStorage,
	audioTable,
	audioTextTable,
	errorsTable,
	ipaTable,
	optionsTable,
} from "../../utils/storage-tables.js";

/**
 * @type {{
 *     ipa: HTMLButtonElement,
 *     audio: HTMLButtonElement,
 *     audioText: HTMLButtonElement,
 *     options: HTMLButtonElement,
 *     errors: HTMLButtonElement,
 *     all: HTMLButtonElement,
 *     storageType: HTMLInputElement,
 *     storageValue: HTMLTextAreaElement,
 * }}
 */
const el = {
	ipa: byId("ipa"),
	audio: byId("audio"),
	audioText: byId("audioText"),
	options: byId("options"),
	errors: byId("errors"),
	all: byId("all"),
	storageType: byId("storageType"),
	storageValue: byId("storageValue"),
};

document.addEventListener("DOMContentLoaded", () => {
	showStorage("", {});
});

el.ipa.addEventListener("click", async () => {
	try {
		const ipaStorage = await ipaTable.getAll();
		await downloadObject(ipaStorage, fileName("pronunciation-ipa-storage.json"));
		showStorage("IPA", ipaStorage);
	} catch (error) {
		console.error(error);
	}
});

el.audio.addEventListener("click", async () => {
	try {
		const audioStorage = await audioTable.getAll();
		await downloadObject(audioStorage, fileName("pronunciation-audio-storage.json"));
		showStorage("Audio", audioStorage);
	} catch (error) {
		console.error(error);
	}
});

el.audioText.addEventListener("click", async () => {
	try {
		const audioTextStorage = await audioTextTable.getAll();
		await downloadObject(audioTextStorage, fileName("pronunciation-audioText-storage.json"));
		showStorage("Audio Text", audioTextStorage);
	} catch (error) {
		console.error(error);
	}
});

el.options.addEventListener("click", async () => {
	try {
		const optionsStorage = await optionsTable.getAll();
		await downloadObject(optionsStorage, fileName("pronunciation-options-storage.json"));
		showStorage("Options", optionsStorage);
	} catch (error) {
		console.error(error);
	}
});

el.errors.addEventListener("click", async () => {
	try {
		const errorsStorage = await errorsTable.getAll();
		await downloadObject(errorsStorage, fileName("pronunciation-errors-storage.json"));
		showStorage("Errors", errorsStorage);
	} catch (error) {
		console.error(error);
	}
});

el.all.addEventListener("click", async () => {
	try {
		const storage = await addonStorage.get();
		await downloadObject(storage, fileName("pronunciation-all-storage.json"));
		showStorage("All", storage);
	} catch (error) {
		console.error(error);
	}
});

/**
 * @param {string} suffix
 * @returns {string}
 */
function fileName(suffix) {
	const prefix = new Date()
		.toISOString()
		.replaceAll(":", "-")
		.replaceAll(".", "-");
	return `${prefix}-${suffix}`;
}

/**
 * @param {string} storageType
 * @param {{ [key: string]: any }} storage
 * @returns {void}
 */
function showStorage(storageType, storage) {
	el.storageType.value = storageType;
	el.storageValue.value = JSON.stringify(storage, null, 4);
	el.storageValue.select();
}
