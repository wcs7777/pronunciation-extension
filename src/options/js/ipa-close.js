import defaultOptions from "../../utils/default-options.js";
import { byId, onlyNumber, onlyShorcut } from "../../utils/element.js";
import { getAllOptions, numOr, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     timeout: HTMLInputElement,
 *     shortcut: HTMLInputElement,
 *     onScroll: HTMLInputElement,
 *     buttonColor: HTMLInputElement,
 *     buttonHoverColor: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	timeout: byId("timeout"),
	shortcut: byId("shortcut"),
	onScroll: byId("onScroll"),
	buttonColor: byId("buttonColor"),
	buttonHoverColor: byId("buttonHoverColor"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		onlyNumber(el.timeout, true);
		onlyShorcut(el.shortcut);
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		/** @type {Options} */
		const options = {
			ipa: {
				close: {
					timeout: numOr(el.timeout.value, defaultOptions.ipa.close.timeout, 500, 3600000),
					shortcut: strOr(el.shortcut.value, defaultOptions.ipa.close.shortcut),
					onScroll: el.onScroll.checked,
					buttonColor: strOr(el.buttonColor.value, defaultOptions.ipa.close.buttonColor),
					buttonHoverColor: strOr(el.buttonHoverColor.value, defaultOptions.ipa.close.buttonHoverColor),
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("IPA Close settings saved");
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
	el.timeout.value = opt.ipa.close.timeout.toString();
	el.shortcut.value = opt.ipa.close.shortcut;
	el.onScroll.checked = opt.ipa.close.onScroll;
	el.buttonColor.value = opt.ipa.close.buttonColor;
	el.buttonHoverColor.value = opt.ipa.close.buttonHoverColor;
}
