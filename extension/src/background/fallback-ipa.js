import { $, url2document, normalizeWord } from "../utils.js";

export default async function fallbackIpa(word) {
	try {
		return await Promise.any([
			ipaFromOxford(word),
			ipaFromCambridge(word),
		]);
	} catch (error) {
		return undefined;
	}
}

async function ipaFromCambridge(word) {
	const base = "https://dictionary.cambridge.org/us/dictionary/english/";
	const document = await url2document(base + word);
	const hw = $("span.hw.dhw", document);
	if (!hw || normalizeWord(hw.textContent) !== word) {
		throw new Error("hw is different from word");
	}
	const ipa = $("span.ipa", document);
	if (!ipa?.textContent) {
		throw new Error("ipa not found");
	}
	return `/${ipa.textContent}/`;
}

async function ipaFromOxford(word) {
	const base = (
		"https://www.oxfordlearnersdictionaries.com/us/definition/english/"
	);
	const document = await url2document(base + word);
	const headword = $("h1.headword", document);
	if (!headword || normalizeWord(headword.textContent) !== word) {
		throw new Error("headword is different from word");
	}
	const phon = $("div.phons_n_am span.phon", document);
	if (!phon?.textContent) {
		throw new Error("phon not found");
	}
	return phon.textContent;
}
