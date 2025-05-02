import defaultOptions from "../../utils/default-options.js";
import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     key: HTMLInputElement,
 *     model: HTMLSelectElement,
 *     modelNotListed: HTMLSelectElement,
 *     voice: HTMLSelectElement,
 *     voiceNotListed: HTMLSelectElement,
 *     responseFormat: HTMLSelectElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	key: byId("key"),
	model: byId("model"),
	modelNotListed: byId("modelNotListed"),
	voice: byId("voice"),
	voiceNotListed: byId("voiceNotListed"),
	responseFormat: byId("responseFormat"),
	save: byId("save"),
};

const model2voices = {
	"Zyphra/Zonos-v0.1-transformer": [
		"american_female",
		"american_male",
		"british_female",
		"british_male",
		"random",
		"none",
	],
	"Zyphra/Zonos-v0.1-hybrid": [
		"american_female",
		"american_male",
		"british_female",
		"british_male",
		"random",
		"none",
	],
	"sesame/csm-1b": [
		"conversational_a",
		"conversational_b",
		"read_speech_a",
		"read_speech_b",
		"read_speech_c",
		"read_speech_d",
		"random",
		"none",
	],
	"hexgrad/Kokoro-82M": [
		"luna",
		"aura",
		"quartz",
		"af_alloy",
		"af_aoede",
		"af_bella",
		"af_heart",
		"af_jessica",
		"af_kore",
		"af_nicole",
		"af_nova",
		"af_river",
		"af_sarah",
		"af_sky",
		"am_adam",
		"am_echo",
		"am_eric",
		"am_fenrir",
		"am_liam",
		"am_michael",
		"am_onyx",
		"am_puck",
		"am_santa",
		"bf_alice",
		"bf_emma",
		"bf_isabella",
		"bf_lily",
		"bm_daniel",
		"bm_fable",
		"bm_george",
		"bm_lewis",
		"ef_dora",
		"em_alex",
		"em_santa",
		"ff_siwis",
		"hf_alpha",
		"hf_beta",
		"hm_omega",
		"hm_psi",
		"if_sara",
		"im_nicola",
		"jf_alpha",
		"jf_gongitsune",
		"jf_nezumi",
		"jf_tebukuro",
		"jm_kumo",
		"pf_dora",
		"pm_alex",
		"pm_santa",
		"zf_xiaobei",
		"zf_xiaoni",
		"zf_xiaoxiao",
		"zf_xiaoyi",
		"zm_yunjian",
		"zm_yunxi",
		"zm_yunxia",
		"zm_yunyang",
		"random",
		"none",
	],
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.model.addEventListener("change", () => {
	try {
		setVoices(el.model.value);
	} catch (e) {
		console.error(e);
	}
});

el.save.addEventListener("click", async () => {
	try {
		const defaultApi = defaultOptions.audio.sources.deepSeek.api;
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					deepSeek: {
						api: {
							key: strOr(el.key.value, defaultApi.key),
							model: strOr(
								strOr(
									el.modelNotListed.value,
									el.model.value,
								),
								defaultApi.model,
							),
							voice: strOr(
								strOr(
									el.voiceNotListed.value,
									el.voice.value,
								),
								defaultApi.voice,
							),
							responseFormat: strOr(el.responseFormat.value, defaultApi.responseFormat),
						},
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("DeepSeek settings saved");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @param {string} model
 * @returns {void}
 */
function setVoices(model) {
	/**
	 * @type {string[]}
	 */
	const options = model in model2voices ? model2voices[model] : ["random"];
	for (const opt of el.voice.querySelectorAll("option")) {
		opt.remove();
	}
	for (const opt of options) {
		const element = document.createElement("option");
		element.value = opt;
		element.textContent = opt;
		el.voice.appendChild(element);
	}
}

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	/**
	 * @type {Options}
	 */
	const opt = await getAllOptions();
	const optApi = opt.audio.sources.deepSeek.api;
	setVoices(optApi.model);
	el.key.value = optApi.key ?? "";
	el.model.value = optApi.model;
	el.modelNotListed.value = "";
	el.voice.value = optApi.voice;
	el.voiceNotListed.value = "";
	el.responseFormat.value = optApi.responseFormat;
}
