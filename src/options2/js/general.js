import defaultOptions from "../../utils/default-options.js";
import { byId, onlyShorcut } from "../../utils/element.js";
import { getAllOptions, saveOptions, strOr, showInfo } from "./utils.js";

/**
 * @type {{
 *     accessKey: HTMLInputElement,
 *     allowText: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	accessKey: byId("accessKey"),
	allowText: byId("allowText"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		onlyShorcut(el.accessKey);
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
			accessKey: strOr(el.accessKey.value, defaultOptions.accessKey),
			allowText: el.allowText.checked,
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "General settings saved");
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
	el.accessKey.value = opt.accessKey;
	el.allowText.checked = opt.allowText;
}
