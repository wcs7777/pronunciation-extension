import "../utils/compromise.js";
import MemoryCache from "./memory-cache.js";

const analysisCache = new MemoryCache("fetchDatamuseCache", 10000);
const datamuseCache = new MemoryCache("fetchDatamuseCache", 10000);

/**
 * @param {string} word
 * @returns {Promise<WordAnalyse>}
 */
export async function cachedAnalyseWord(word) {
	/**
	 * @type {WordAnalyse}
	 */
	let analysis = analysisCache.get(word, false);
	if (!analysis) {
		analysis = analyseWord(word);
		analysisCache.set(word, analysis);
	}
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
	let confidence = output[0]?.confidence;
	if (confidence < 1) {
		/**
		 * @type {{word: string, score: number}}
		 */
		const entry = { word: "", score: 0 };
		/**
		 * @type {{word: string, score: number}}
		 */
		const cached = datamuseCache.get(word, false);
		if (cached) {
			entry.word = cached.word;
			entry.score = cached.score;
		} else {
			const endpoint = "https://api.datamuse.com/words?";
			const params = new URLSearchParams({
				sp: word,
				max: 1,
			}).toString();
			const response = await fetch(`${endpoint}${params}`, {
				method: "GET",
				credentials: "omit",
			});
			if (response.status === 200) {
				/**
				 * @type {{word: string, score: number}[]}
				 */
				const jsonResponse = await response.json();
				entry.word = jsonResponse?.[0]?.word;
				entry.score = jsonResponse?.[0]?.score;
				if (entry.word === word && entry.score > 1000) {
					confidence = 1;
				}
				datamuseCache.set(word, entry);
			} else {
				console.error(`datamuse ${response.status}`);
			}
		}
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
