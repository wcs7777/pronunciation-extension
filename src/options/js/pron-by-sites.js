import defaultOptions from "../../utils/default-options.js";
import { byId, onlyShorcut } from "../../utils/element.js";
import { getAllOptions, saveOptions, strOr, showInfo } from "./utils.js";

/**
 * @type {{
 *     enabled: HTMLInputElement,
 *     audioShortcut: HTMLInputElement,
 *     ipaShortcut: HTMLInputElement,
 *     restoreDefaultIpaShortcut: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	enabled: byId("enabled"),
	audioShortcut: byId("audioShortcut"),
	ipaShortcut: byId("ipaShortcut"),
	restoreDefaultIpaShortcut: byId("restoreDefaultIpaShortcut"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		[
			el.audioShortcut,
			el.ipaShortcut,
			el.restoreDefaultIpaShortcut,
		].forEach(e => onlyShorcut(e, false));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		/** @type {Options} */
		const options = {
			setPronuncationByShortcut: {
				enabled: el.enabled.checked,
				audioShortcut: strOr(el.audioShortcut.value, defaultOptions.setPronuncationByShortcut.audioShortcut),
				ipaShortcut: strOr(el.ipaShortcut.value, defaultOptions.setPronuncationByShortcut.ipaShortcut),
				restoreDefaultIpaShortcut: strOr(el.restoreDefaultIpaShortcut.value, defaultOptions.setPronuncationByShortcut.restoreDefaultIpaShortcut),
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("Pronunciation By Sites (Cambridge, Oxford) settings saved");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	/** @type {Options} */
	const opt = await getAllOptions();
	el.enabled.checked = opt.setPronuncationByShortcut.enabled;
	el.ipaShortcut.value = opt.setPronuncationByShortcut.ipaShortcut;
	el.audioShortcut.value = opt.setPronuncationByShortcut.audioShortcut;
	el.restoreDefaultIpaShortcut.value = opt.setPronuncationByShortcut.restoreDefaultIpaShortcut;
}
