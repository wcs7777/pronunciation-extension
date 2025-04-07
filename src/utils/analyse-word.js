import "../utils/compromise.js";

/**
 * @param {string} word
 * @returns {WordAnalyse}
 */
export default function analyseWord(word) {
	const doc = nlp(word);
	const view = doc.compute("root");
	const output = view.json({
		text: false,
		normal: false,
		terms: true,
		offset: false,
		confidence: true,
	});
	const root = output[0]?.terms?.[0]?.root ?? word;
	const type = output[0]?.terms?.[0]?.chunk ?? "Noun";
	const confidence = output[0]?.confidence;
	return { root, confidence, type };
}
