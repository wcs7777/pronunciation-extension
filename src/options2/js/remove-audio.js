import { audioTable } from "../../utils/mock-storage-tables.js";
import { byId } from "../../utils/element.js";
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

el.remove.addEventListener("click", async ({ currentTarget }) => {
	try {
		const rawWord = el.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			showInfo(currentTarget, "No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			showInfo(currentTarget, `Word max length is 45, but this has ${word.length}`);
			return;
		}
		await audioTable.remove(word);
		await setFieldsValues();
		showInfo(currentTarget, `${word} audio removed`);
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
