import defaultOptions from "../../utils/default-options.js";
import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     accessKeyId: HTMLInputElement,
 *     secretAccessKey: HTMLInputElement,
 *     endpoint: HTMLSelectElement,
 *     engine: HTMLSelectElement,
 *     outputFormat: HTMLSelectElement,
 *     sampleRate: HTMLSelectElement,
 *     voiceId: HTMLSelectElement,
 *     voiceIdNotListed: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	accessKeyId: byId("accessKeyId"),
	secretAccessKey: byId("secretAccessKey"),
	endpoint: byId("endpoint"),
	engine: byId("engine"),
	outputFormat: byId("outputFormat"),
	sampleRate: byId("sampleRate"),
	voiceId: byId("voiceId"),
	voiceIdNotListed: byId("voiceIdNotListed"),
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
		const defaultApi = defaultOptions.audio.sources.amazonPolly.api;
		/** @type {Options} */
		const options = {
			audio: {
				sources: {
					amazonPolly: {
						api: {
							accessKeyId: strOr(el.accessKeyId.value, defaultApi.accessKeyId),
							secretAccessKey: strOr(el.secretAccessKey.value, defaultApi.secretAccessKey),
							endpoint: strOr(el.endpoint.value, defaultApi.endpoint),
							engine: strOr(el.engine.value, defaultApi.engine),
							outputFormat: strOr(el.outputFormat.value, defaultApi.outputFormat),
							sampleRate: strOr(el.sampleRate.value, defaultApi.sampleRate),
							voiceId: strOr(
								strOr(
									el.voiceIdNotListed.value,
									el.voiceId.value,
								),
								defaultApi.voiceId,
							),
						},
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("Amazon Polly settings saved");
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
	const optApi = opt.audio.sources.amazonPolly.api;
	el.accessKeyId.value = optApi.accessKeyId ?? "";
	el.secretAccessKey.value = optApi.secretAccessKey ?? "";
	el.endpoint.value = optApi.endpoint;
	el.engine.value = optApi.engine;
	el.outputFormat.value = optApi.outputFormat;
	el.sampleRate.value = optApi.sampleRate;
	el.voiceId.value = optApi.voiceId;
	el.voiceIdNotListed.value = "";
}
