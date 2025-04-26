import { byId } from "../../utils/element.js";
import { ipaTable } from "../../utils/mock-storage-tables.js";
import { showInfo } from "./utils.js";
import { splitWords } from "../../utils/string.js";

/**
 * @type {{
 *     word: HTMLInputElement,
 *     ipa: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	word: byId("word"),
	ipa: byId("ipa"),
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
		const ipa = el.ipa.value.trim();
		if (ipa.length === 0) {
			showInfo(currentTarget, "No IPA was found in input");
			return;
		}
		if (ipa.length > 60) {
			showInfo(currentTarget, `IPA max length is 60, but this has ${ipa.length}`);
			return;
		}
		await ipaTable.set(word, ipa);
		await setFieldsValues();
		showInfo(currentTarget, `${word} = ${ipa}`);
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	el.word.value = "";
	el.ipa.value = "";
}
