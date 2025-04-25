import defaultOptions from "../../utils/default-options.js";
import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo, strOr, } from "./utils.js";

/**
 * @type {{
 *     token: HTMLInputElement,
 *     voiceId: HTMLSelectElement,
 *     voiceIdNotListed: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	token: byId("token"),
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

el.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		const defaultApi = defaultOptions.audio.sources.speechify.api;
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				sources: {
					speechify: {
						api: {
							token: strOr(el.token.value, defaultApi.token),
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
		showInfo(currentTarget, "Speechify settings saved");
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
	el.token.value = opt.audio.sources.speechify.api.token ?? "";
	el.voiceId.value = opt.audio.sources.speechify.api.voiceId;
	el.voiceIdNotListed.value = "";
}
