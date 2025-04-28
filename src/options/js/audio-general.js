import defaultOptions from "../../utils/default-options.js";
import { byId, onlyNumber } from "../../utils/element.js";
import { getAllOptions, numOr, saveOptions, showInfo } from "./utils.js";

/**
 * @type {{
 *     enabled: HTMLInputElement,
 *     showSourceLastError: HTMLInputElement,
 *     volume: HTMLInputElement,
 *     playbackRate: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	enabled: byId("enabled"),
	showSourceLastError: byId("showSourceLastError"),
	volume: byId("volume"),
	playbackRate: byId("playbackRate"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		[
			el.volume,
			el.playbackRate,
		].forEach(e => onlyNumber(e, true));
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
				enabled: el.enabled.checked,
				showSourceLastError: el.showSourceLastError.checked,
				volume: numOr(el.volume.value, defaultOptions.audio.volume, 0, 1),
				playbackRate: numOr(el.playbackRate.value, defaultOptions.audio.playbackRate, 0.2, 2),
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("Audio General settings saved");
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
	el.enabled.checked = opt.audio.enabled;
	el.showSourceLastError.checked = opt.audio.showSourceLastError;
	el.volume.value = opt.audio.volume.toString();
	el.playbackRate.value = opt.audio.playbackRate.toString();
}
