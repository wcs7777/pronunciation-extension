import { audioTextTable } from "../../utils/mock-storage-tables.js";
import { byId, blob2base64 } from "../../utils/element.js";
import { generateSha1, removeExtraSpaces } from "../../utils/string.js";
import { showInfo } from "./utils.js";

/**
 * @type {{
 *     text: HTMLTextAreaElement,
 *     file: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	text: byId("text"),
	file: byId("file"),
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
		const rawText = el.text.value.trim();
		if (rawText.length === 0) {
			showInfo(currentTarget, "No text was found in input");
			return;
		}
		const key = await generateSha1(removeExtraSpaces(rawText));
		const file = el.file.files?.[0];
		if (!file) {
			showInfo(currentTarget, "No file was found in input");
			return;
		}
		const mb = file.size / 1000 / 1000;
		const maxSize = 500;
		if (mb > maxSize) {
			showInfo(currentTarget, `File max size is ${maxSize}MB, but this has ${mb}MB`);
			return;
		}
		try {
			const base64 = await blob2base64(file);
			const audio = new Audio(base64);
			audio.volume = 0;
			await audio.play();
			audio.pause();
			await audioTextTable.set(key, base64);
			await setFieldsValues();
			showInfo(currentTarget, `${key} audio text saved`);
		} catch (error) {
			showInfo(currentTarget, `Error with the file: ${error}`);
			console.error(error);
		}
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	el.text.value = "";
	el.file.value = "";
}
