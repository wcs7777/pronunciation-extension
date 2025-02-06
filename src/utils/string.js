const wordPattern = /([A-Za-z\u00C0-\u024F\-']+)/g;

/**
 * @param {string} text
 * @returns {string[]}
 */
export function splitWords(text) {
	const words = text
		.trim()
		.replaceAll("’", "'")
		.match(wordPattern)
	return words ? words : [];
}

/**
 * @param {string} text
 * @param {number[]} ends
 * @returns {string[]}
 */
export function textHierarchy(text, ends) {
	return ends.map(end => text.slice(0, end));
}
