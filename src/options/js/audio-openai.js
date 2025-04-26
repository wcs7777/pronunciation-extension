import defaultOptions from "../../utils/default-options.js";
import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     key: HTMLInputElement,
 *     model: HTMLSelectElement,
 *     voice: HTMLSelectElement,
 *     responseFormat: HTMLSelectElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	key: byId("key"),
	model: byId("model"),
	voice: byId("voice"),
	responseFormat: byId("responseFormat"),
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
		const defaultApi = defaultOptions.audio.sources.openAi.api;
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					openAi: {
						api: {
							key: strOr(el.key.value, defaultApi.key),
							model: strOr(el.model.value, defaultApi.model),
							voice: strOr(el.voice.value, defaultApi.voice),
							responseFormat: strOr(el.responseFormat.value, defaultApi.responseFormat),
						},
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "OpenAI settings saved");
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
	const optApi = opt.audio.sources.openAi.api;
	el.key.value = optApi.key ?? "";
	el.model.value = optApi.model;
	el.voice.value = optApi.voice;
	el.responseFormat.value = optApi.responseFormat;
}
