import { byId } from "../../utils/element.js";
import { ipaTable } from "../../utils/storage-tables.js";
import { showInfo } from "./utils.js";
import { splitWords } from "../../utils/string.js";

/**
 * @type {{
 *     word: HTMLInputElement,
 *     remove: HTMLButtonElement,
 * }}
 */
const el = {
	word: byId("word"),
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
		await ipaTable.remove(word);
		await setFieldsValues();
		showInfo(`${word} IPA removed`);
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	el.word.value = "";
}
