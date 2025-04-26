import { audioTextTable } from "../../utils/mock-storage-tables.js";
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

el.remove.addEventListener("click", async ({ currentTarget }) => {
	try {
		const rawText = el.text.value.trim();
		if (rawText.length === 0) {
			showInfo(currentTarget, "No text was found in input");
			return;
		}
		const key = await generateSha1(removeExtraSpaces(rawText));
		await audioTextTable.remove(key);
		await setFieldsValues();
		showInfo(currentTarget, `${key} audio text removed`);
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
