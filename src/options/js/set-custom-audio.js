import { byId, blob2base64 } from "../../utils/element.js";
import { audioTable } from "../../utils/storage-tables.js";
import { showInfo } from "./utils.js";
import { splitWords } from "../../utils/string.js";

/** @type {{ word: HTMLInputElement,
 *     file: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	word: byId("word"),
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

el.save.addEventListener("click", async () => {
	try {
		const rawWord = el.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			showInfo("No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			showInfo(`Word max length is 45, but this has ${word.length}`);
			return;
		}
		const file = el.file.files?.[0];
		if (!file) {
			showInfo("No file was found in input");
			return;
		}
		const kb = file.size / 1000;
		const maxSize = 200;
		if (kb > maxSize) {
			showInfo(`File max size is ${maxSize}KB, but this has ${kb}KB`);
			return;
		}
		try {
			const base64 = await blob2base64(file);
			const audio = new Audio(base64);
			audio.volume = 0;
			await audio.play();
			audio.pause();
			await audioTable.set(word, base64);
			await setFieldsValues();
			showInfo(`${word} audio saved`);
		} catch (error) {
			showInfo(`Error with the file: ${error}`);
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
	el.word.value = "";
	el.file.value = "";
}
