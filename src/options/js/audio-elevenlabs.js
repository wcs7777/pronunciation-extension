import defaultOptions from "../../utils/default-options.js";
import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     key: HTMLInputElement,
 *     voiceId: HTMLSelectElement,
 *     voiceIdNotListed: HTMLInputElement,
 *     outputFormat: HTMLSelectElement,
 *     modelId: HTMLSelectElement,
 *     applyTextNormalization: HTMLSelectElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	key: byId("key"),
	voiceId: byId("voiceId"),
	voiceIdNotListed: byId("voiceIdNotListed"),
	outputFormat: byId("outputFormat"),
	modelId: byId("modelId"),
	applyTextNormalization: byId("applyTextNormalization"),
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
		const defaultApi = defaultOptions.audio.sources.elevenLabs.api;
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					elevenLabs: {
						api: {
							key: strOr(el.key.value, defaultApi.key),
							voiceId: strOr(
								strOr(
									el.voiceIdNotListed.value,
									el.voiceId.value,
								),
								defaultApi.voiceId,
							),
							outputFormat: strOr(el.outputFormat.value, defaultApi.outputFormat),
							modelId: strOr(el.modelId.value, defaultApi.modelId),
							applyTextNormalization: strOr(el.applyTextNormalization.value, defaultApi.applyTextNormalization),
						},
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("ElevenLabs settings saved");
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
	const optApi = opt.audio.sources.elevenLabs.api;
	el.key.value = optApi.key ?? "";
	el.voiceId.value = optApi.voiceId;
	el.voiceIdNotListed.value = "";
	el.outputFormat.value = optApi.outputFormat;
	el.modelId.value = optApi.modelId;
	el.applyTextNormalization.value = optApi.applyTextNormalization;
}
