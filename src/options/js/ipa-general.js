import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";

/**
 * @type {{
 *     enabled: HTMLInputElement,
 *     enabledToText: HTMLInputElement,
 *     showSourceLastError: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	enabled: byId("enabled"),
	enabledToText: byId("enabledToText"),
	showSourceLastError: byId("showSourceLastError"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
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
				enabled: el.enabled.checked,
				text: { enabled: el.enabledToText.checked },
				showSourceLastError: el.showSourceLastError.checked,
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("IPA General settings saved");
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
	el.enabled.checked = opt.ipa.enabled;
	el.enabledToText.checked = opt.ipa.text.enabled;
	el.showSourceLastError.checked = opt.ipa.showSourceLastError;
}
