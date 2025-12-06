import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";

/**
 * @type {{
 *     menuTriggered: HTMLSelectElement,
 *     actionTriggered: HTMLSelectElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	menuTriggered: byId("menuTriggered"),
	actionTriggered: byId("actionTriggered"),
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
		/** @type {Options} */
		const options = {
			ipa: {
				position: {
					menuTriggered: el.menuTriggered.value,
					actionTriggered: el.actionTriggered.value,
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("IPA Style settings saved");
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
	el.menuTriggered.value = opt.ipa.position.menuTriggered;
	el.actionTriggered.value = opt.ipa.position.actionTriggered;
}
