import { url2document } from "./utils/element.js";

/**
 * @param {string} word
 * @returns {Promise<string>}
 */
export async function ipaFromCambridge(word) {
	const base = "https://dictionary.cambridge.org/us/dictionary/english/";
	const document = await url2document(`${base}${word}`);
	const hw = document.querySelector("span.hw.dhw");
	if (!hw) {
		throw new Error(`hd not foudn for ${word}`);
	}
	if (hw.textContent !== word) {
		throw new Error(`${word} is different from ${hw.textContent}`);
	}
	const ipa = document.querySelector("span.ipa");
	if (!ipa?.textContent) {
		throw new Error(`ipa not found for ${word}`);
	}
	return `/${ipa.textContent}/`;
}

/**
 * @param {string} word
 * @returns {Promise<string>}
 */
export async function ipaFromOxford(word) {
	const base = "https://www.oxfordlearnersdictionaries.com/us/definition/english/";
	const document = await url2document(`${base}${word}`);
	const headword = document.querySelector("h1.headword");
	if (!headword) {
		throw new Error(`headword not found for ${word}`);
	}
	if (headword.textContent != word) {
		throw new Error(`${word} is different from ${headword.textContent}`);
	}
	const phon = document.querySelector("div.phons_n_am span.phon");
	if (!phon?.textContent) {
		throw new Error(`phon not found for ${word}`);
	}
	return phon.textContent;
}

/**
 * @param {string} word
 * @returns {Promise<string>}
 */
export async function ipaFromUnalengua(word) {
	const response = await fetch("https://api2.unalengua.com/ipav3", {
		method: "POST",
		credentials: "omit",
		body: JSON.stringify({
			"lang": "en-US",
			"mode": true,
			"text": word,
		}),
	});
	const status = response.status;
	if (status !== 200) {
		const message = await response.text();
		console.error(message);
		throw new Error(JSON.stringify({ status, message}));
	}
	const jsonResponse = await response.json();
	const ipa = jsonResponse["ipa"];
	return `/${ipa}/`;
}
