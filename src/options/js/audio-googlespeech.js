import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";

/**
 * @type {{
 *     saveAudio: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	saveAudio: byId("saveAudio"),
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
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					googleSpeech: {
						save: el.saveAudio.checked,
					},
				},
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
	el.saveAudio.checked = opt.audio.sources.googleSpeech.save;
}
