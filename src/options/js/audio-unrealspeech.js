import defaultOptions from "../../utils/default-options.js";
import { byId, onlyNumber } from "../../utils/element.js";
import { getAllOptions, numOr, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     token: HTMLInputElement,
 *     voiceId: HTMLSelectElement,
 *     bitRate: HTMLSelectElement,
 *     pitch: HTMLInputElement,
 *     codec: HTMLSelectElement,
 *     temperature: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	token: byId("token"),
	voiceId: byId("voiceId"),
	bitRate: byId("bitRate"),
	pitch: byId("pitch"),
	codec: byId("codec"),
	temperature: byId("temperature"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		[
			el.pitch,
			el.temperature,
		].forEach(e => onlyNumber(e, true));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		const defaultApi = defaultOptions.audio.sources.unrealSpeech.api;
		/** @type {Options} */
		const options = {
			audio: {
				sources: {
					unrealSpeech: {
						api: {
							token: strOr(el.token.value, defaultApi.token),
							voiceId: strOr(el.voiceId.value, defaultApi.voiceId),
							bitRate: strOr(el.bitRate.value, defaultApi.bitRate),
							pitch: numOr(el.pitch.value, defaultApi.pitch, 0.5, 1.5),
							codec: strOr(el.codec.value, defaultApi.codec),
							temperature: numOr(el.temperature.value, defaultApi.temperature, 0.1, 0.8),
						},
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("UnrealSpeech settings saved");
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
	const optApi = opt.audio.sources.unrealSpeech.api;
	el.token.value = optApi.token ?? "";
	el.voiceId.value = optApi.voiceId;
	el.bitRate.value = optApi.bitRate;
	el.pitch.value = optApi.pitch.toString();
	el.codec.value = optApi.codec;
	el.temperature.value = optApi.temperature.toString();
}
