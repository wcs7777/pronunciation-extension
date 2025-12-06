import "./compromise.js";
import MemoryCache from "../../utils/memory-cache.js";

const analysisCache = new MemoryCache("analysisCache", 10000);
const scrabbleCache = new MemoryCache("fetchScrabbleCache", 10000);

/**
 * @param {string} word
 * @returns {Promise<WordAnalyse>}
 */
export async function cachedAnalyseWord(word) {
	/**
	 * @type {WordAnalyse}
	 */
	let analysis = analysisCache.get(word);
	if (!analysis) {
		analysis = await analyseWord(word);
		analysisCache.set(word, analysis);
	}
	console.log({ word, analysis });
	return analysis;
}

/**
 * @param {string} word
 * @returns {Promise<WordAnalyse>}
 */
export async function analyseWord(word) {
	const doc = nlp(word);
	const view = doc.compute("root");
	const output = view.json({
		text: false,
		normal: false,
		terms: true,
		offset: false,
		confidence: true,
	});
	const type = output[0]?.terms?.[0]?.chunk ?? "Noun";
	let root = output[0]?.terms?.[0]?.root ?? word;
	let confidence = output[0]?.confidence ?? 0;
	if (confidence < 1) {
		/**
		 * @type {number}
		 */
		let status = scrabbleCache.get(word);
		if (!status) {
			const endpoint = "https://s3-us-west-2.amazonaws.com/words.alexmeub.com/nwl2023/"
			const response = await fetch(`${endpoint}${word}.json`, {
				method: "HEAD",
				credentials: "omit",
			});
			status = response.status;
		}
		confidence = status === 200 ? 1 : 0;
		scrabbleCache.set(word, status);
	} else if (
		word !== root &&
		(word.includes("'") || word.includes("-"))
	) {
		root = word;
	}
	return {
		root,
		confidence,
		type,
		isVerb: type === "Verb",
		isNoun: type === "Noun",
		isValid: confidence > 0.9,
		isText: false,
	};
}
