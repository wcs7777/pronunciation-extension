import defaultOptions from "../../utils/default-options.js";
import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     key: HTMLInputElement,
 *     gender: HTMLSelectElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	key: byId("key"),
	gender: byId("gender"),
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
		const defaultApi = defaultOptions.audio.sources.responsiveVoice.api;
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					responsiveVoice: {
						api: {
							key: strOr(el.key.value, defaultApi.key),
							gender: strOr(el.gender.value, defaultApi.gender),
						},
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "ResponsiveVoice settings saved");
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
	const optApi = opt.audio.sources.responsiveVoice.api;
	el.key.value = optApi.key;
	el.gender.value = optApi.gender;
}
