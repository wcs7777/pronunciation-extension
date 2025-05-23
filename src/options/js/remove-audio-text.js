import { audioTextTable } from "../../utils/storage-tables.js";
import { byId } from "../../utils/element.js";
import { generateSha1, removeExtraSpaces } from "../../utils/string.js";
import { showInfo } from "./utils.js";

/**
 * @type {{
 *     text: HTMLTextAreaElement,
 *     remove: HTMLButtonElement,
 * }}
 */
const el = {
	text: byId("text"),
	remove: byId("remove"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.remove.addEventListener("click", async () => {
	try {
		const rawText = el.text.value.trim();
		if (rawText.length === 0) {
			showInfo("No text was found in input");
			return;
		}
		const key = await generateSha1(removeExtraSpaces(rawText));
		await audioTextTable.remove(key);
		await setFieldsValues();
		showInfo(`${key} audio text removed`);
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	el.text.value = "";
}
