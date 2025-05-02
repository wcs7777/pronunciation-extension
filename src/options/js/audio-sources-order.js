import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";
import { createSortableOrder, sortSortableOrder } from "./utils-sortable.js";

/**
 * @type {{
 *     cambridge: HTMLElement,
 *     cambridgeEnabled: HTMLInputElement,
 *     linguee: HTMLElement,
 *     lingueeEnabled: HTMLInputElement,
 *     oxford: HTMLElement,
 *     oxfordEnabled: HTMLInputElement,
 *     gstatic: HTMLElement,
 *     gstaticEnabled: HTMLInputElement,
 *     googleSpeech: HTMLElement,
 *     googleSpeechEnabled: HTMLInputElement,
 *     responsiveVoice: HTMLElement,
 *     responsiveVoiceEnabled: HTMLInputElement,
 *     unrealSpeech: HTMLElement,
 *     unrealSpeechEnabled: HTMLInputElement,
 *     speechify: HTMLElement,
 *     speechifyEnabled: HTMLInputElement,
 *     playHt: HTMLElement,
 *     playHtEnabled: HTMLInputElement,
 *     elevenLabs: HTMLElement,
 *     elevenLabsEnabled: HTMLInputElement,
 *     amazonPolly: HTMLElement,
 *     amazonPollyEnabled: HTMLInputElement,
 *     openAi: HTMLElement,
 *     openAiEnabled: HTMLInputElement,
 *     deepSeek: HTMLElement,
 *     deepSeekEnabled: HTMLInputElement,
 * }}
 */
const el = {
	cambridge: byId("cambridgeOrder"),
	cambridgeEnabled: byId("cambridgeEnabled"),
	linguee: byId("lingueeOrder"),
	lingueeEnabled: byId("lingueeEnabled"),
	oxford: byId("oxfordOrder"),
	oxfordEnabled: byId("oxfordEnabled"),
	gstatic: byId("gstaticOrder"),
	gstaticEnabled: byId("gstaticEnabled"),
	googleSpeech: byId("googleSpeechOrder"),
	googleSpeechEnabled: byId("googleSpeechEnabled"),
	responsiveVoice: byId("responsiveVoiceOrder"),
	responsiveVoiceEnabled: byId("responsiveVoiceEnabled"),
	unrealSpeech: byId("unrealSpeechOrder"),
	unrealSpeechEnabled: byId("unrealSpeechEnabled"),
	speechify: byId("speechifyOrder"),
	speechifyEnabled: byId("speechifyEnabled"),
	playHt: byId("playHtOrder"),
	playHtEnabled: byId("playHtEnabled"),
	elevenLabs: byId("elevenLabsOrder"),
	elevenLabsEnabled: byId("elevenLabsEnabled"),
	amazonPolly: byId("amazonPollyOrder"),
	amazonPollyEnabled: byId("amazonPollyEnabled"),
	openAi: byId("openAiOrder"),
	openAiEnabled: byId("openAiEnabled"),
	deepSeek: byId("deepSeekOrder"),
	deepSeekEnabled: byId("deepSeekEnabled"),
	save: byId("save"),
};

/**
 * @type {SortableJS}
 */
let sortable = null;

document.addEventListener("DOMContentLoaded", async () => {
	try {
		sortable = createSortableOrder(byId("sourcesOrder"), "order");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					cambridge: {
						enabled: el.cambridgeEnabled.checked,
						order: parseInt(el.cambridge.dataset.order),
					},
					linguee: {
						enabled: el.lingueeEnabled.checked,
						order: parseInt(el.linguee.dataset.order),
					},
					oxford: {
						enabled: el.oxfordEnabled.checked,
						order: parseInt(el.oxford.dataset.order),
					},
					gstatic: {
						enabled: el.gstaticEnabled.checked,
						order: parseInt(el.gstatic.dataset.order),
					},
					googleSpeech: {
						enabled: el.googleSpeechEnabled.checked,
						order: parseInt(el.googleSpeech.dataset.order),
					},
					responsiveVoice: {
						enabled: el.responsiveVoiceEnabled.checked,
						order: parseInt(el.responsiveVoice.dataset.order),
					},
					unrealSpeech: {
						enabled: el.unrealSpeechEnabled.checked,
						order: parseInt(el.unrealSpeech.dataset.order),
					},
					speechify: {
						enabled: el.speechifyEnabled.checked,
						order: parseInt(el.speechify.dataset.order),
					},
					playHt: {
						enabled: el.playHtEnabled.checked,
						order: parseInt(el.playHt.dataset.order),
					},
					elevenLabs: {
						enabled: el.elevenLabsEnabled.checked,
						order: parseInt(el.elevenLabs.dataset.order),
					},
					amazonPolly: {
						enabled: el.amazonPollyEnabled.checked,
						order: parseInt(el.amazonPolly.dataset.order),
					},
					openAi: {
						enabled: el.openAiEnabled.checked,
						order: parseInt(el.openAi.dataset.order),
					},
					deepSeek: {
						enabled: el.deepSeekEnabled.checked,
						order: parseInt(el.deepSeek.dataset.order),
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("Audio Sources Order settings saved");
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
	el.cambridgeEnabled.checked = opt.audio.sources.cambridge.enabled;
	el.lingueeEnabled.checked = opt.audio.sources.linguee.enabled;
	el.oxfordEnabled.checked = opt.audio.sources.oxford.enabled;
	el.gstaticEnabled.checked = opt.audio.sources.gstatic.enabled;
	el.googleSpeechEnabled.checked = opt.audio.sources.googleSpeech.enabled;
	el.responsiveVoiceEnabled.checked = opt.audio.sources.responsiveVoice.enabled;
	el.unrealSpeechEnabled.checked = opt.audio.sources.unrealSpeech.enabled;
	el.speechifyEnabled.checked = opt.audio.sources.speechify.enabled;
	el.playHtEnabled.checked = opt.audio.sources.playHt.enabled;
	el.elevenLabsEnabled.checked = opt.audio.sources.elevenLabs.enabled;
	el.amazonPollyEnabled.checked = opt.audio.sources.amazonPolly.enabled;
	el.openAiEnabled.checked = opt.audio.sources.openAi.enabled;
	el.deepSeekEnabled.checked = opt.audio.sources.deepSeek.enabled;
	sortSortableOrder(sortable, el, opt.audio.sources, "order");
}
