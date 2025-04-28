import defaultOptions from "../../utils/default-options.js";
import { byId, onlyNumber } from "../../utils/element.js";
import { getAllOptions, numOr, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     userId: HTMLInputElement,
 *     key: HTMLInputElement,
 *     voiceId: HTMLSelectElement,
 *     voiceIdNotListed: HTMLInputElement,
 *     quality: HTMLSelectElement,
 *     outputFormat: HTMLSelectElement,
 *     sampleRate: HTMLInputElement,
 *     temperature: HTMLInputElement,
 *     voiceEngine: HTMLSelectElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	userId: byId("userId"),
	key: byId("key"),
	voiceId: byId("voiceId"),
	voiceIdNotListed: byId("voiceIdNotListed"),
	quality: byId("quality"),
	outputFormat: byId("outputFormat"),
	sampleRate: byId("sampleRate"),
	temperature: byId("temperature"),
	voiceEngine: byId("voiceEngine"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		[
			el.sampleRate,
			el.temperature,
		].forEach(e => onlyNumber(e, true));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		const defaultApi = defaultOptions.audio.sources.playHt.api;
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					playHt: {
						api: {
							userId: strOr(el.userId.value, defaultApi.userId),
							key: strOr(el.key.value, defaultApi.key),
							voiceId: strOr(
								strOr(
									el.voiceIdNotListed.value,
									el.voiceId.value,
								),
								defaultApi.voiceId,
							),
							quality: strOr(el.quality.value, defaultApi.quality),
							outputFormat: strOr(el.outputFormat.value, defaultApi.outputFormat),
							sampleRate: numOr(el.sampleRate.value, defaultApi.sampleRate, 8000, 48000),
							temperature: numOr(el.temperature.value, defaultApi.temperature, 0, 2),
							voiceEngine: strOr(el.voiceEngine.value, defaultApi.voiceEngine),
						},
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("PlayHT settings saved");
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
	const optApi = opt.audio.sources.playHt.api;
	el.userId.value = optApi.userId ?? "";
	el.key.value = optApi.key ?? "";
	el.voiceId.value = optApi.voiceId;
	el.voiceIdNotListed.value = "";
	el.quality.value = optApi.quality;
	el.outputFormat.value = optApi.outputFormat;
	el.sampleRate.value = (optApi.sampleRate ?? "").toString();
	el.temperature.value = (optApi.temperature ?? "").toString();
	el.voiceEngine.value = optApi.voiceEngine;
}
