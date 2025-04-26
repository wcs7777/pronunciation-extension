import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";
import { createSortableOrder, sortSortableOrder } from "./utils-sortable.js";

/**
 * @type {{
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
 * }}
 */
const el = {
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
	save: byId("save"),
};

/**
 * @type {SortableJS}
 */
let sortable = null;

document.addEventListener("DOMContentLoaded", async () => {
	try {
		sortable = createSortableOrder(byId("sourcesOrder"), "order-to-text");
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
			audio: {
				sources: {
					googleSpeech: {
						enabledToText: el.googleSpeechEnabled.checked,
						orderToText: parseInt(el.googleSpeech.dataset.orderToText),
					},
					responsiveVoice: {
						enabledToText: el.responsiveVoiceEnabled.checked,
						orderToText: parseInt(el.responsiveVoice.dataset.orderToText),
					},
					unrealSpeech: {
						enabledToText: el.unrealSpeechEnabled.checked,
						orderToText: parseInt(el.unrealSpeech.dataset.orderToText),
					},
					speechify: {
						enabledToText: el.speechifyEnabled.checked,
						orderToText: parseInt(el.speechify.dataset.orderToText),
					},
					playHt: {
						enabledToText: el.playHtEnabled.checked,
						orderToText: parseInt(el.playHt.dataset.orderToText),
					},
					elevenLabs: {
						enabledToText: el.elevenLabsEnabled.checked,
						orderToText: parseInt(el.elevenLabs.dataset.orderToText),
					},
					amazonPolly: {
						enabledToText: el.amazonPollyEnabled.checked,
						orderToText: parseInt(el.amazonPolly.dataset.orderToText),
					},
					openAi: {
						enabledToText: el.openAiEnabled.checked,
						orderToText: parseInt(el.openAi.dataset.orderToText),
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "Audio Sources Order to Text settings saved");
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
	el.googleSpeechEnabled.checked = opt.audio.sources.googleSpeech.enabledToText;
	el.responsiveVoiceEnabled.checked = opt.audio.sources.responsiveVoice.enabledToText;
	el.unrealSpeechEnabled.checked = opt.audio.sources.unrealSpeech.enabledToText;
	el.speechifyEnabled.checked = opt.audio.sources.speechify.enabledToText;
	el.playHtEnabled.checked = opt.audio.sources.playHt.enabledToText;
	el.elevenLabsEnabled.checked = opt.audio.sources.elevenLabs.enabledToText;
	el.amazonPollyEnabled.checked = opt.audio.sources.amazonPolly.enabledToText;
	el.openAiEnabled.checked = opt.audio.sources.openAi.enabledToText;
	sortSortableOrder(sortable, el, opt.audio.sources, "order-to-text");
}
