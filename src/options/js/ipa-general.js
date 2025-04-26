import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";

/**
 * @type {{
 *     enabled: HTMLInputElement,
 *     enabledToText: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	enabled: byId("enabled"),
	enabledToText: byId("enabledToText"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			ipa: {
				enabled: el.enabled.checked,
				text: { enabled: el.enabledToText.checked },
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "IPA General settings saved");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	/**
	 * @type {Options}
	 */
	const opt = await getAllOptions();
	el.enabled.checked = opt.ipa.enabled;
	el.enabledToText.checked = opt.ipa.text.enabled;
}
