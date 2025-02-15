const wordPattern = /([A-Za-z\u00C0-\u024F\-']+)/g;
const digitPattern = /\d+/g;
const spacePattern = /\s+/g;

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
 * Replace one or more spaces with one space
 * @param {string} text
 * @returns {string}
 */
export function oneSpace(text) {
	return text.replaceAll(spacePattern, " ");
}

/**
 * @param {string} text
 * @returns {string}
 */
export function filterDigits(text) {
	return text.match(digitPattern).join("");
}

/**
 * @param {string} rgba
 * @returns {string}
 */
export function rgba2rgb(rgba) {
	if (rgba.startsWith("rgba")) {
		return rgba
			.replace("a", "")
			.slice(0, rgba.lastIndexOf(",") -1)
			.concat(")");
	} else {
		return rgba;
	}
}

/**
 * @param {string} text
 * @param {number[]} ends
 * @returns {string[]}
 */
export function textHierarchy(text, ends) {
	return ends.map(end => text.slice(0, end));
}

/**
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function generateSha1(message) {
	const encoder = new TextEncoder();
	const hashBuffer = encoder.encode(encoder.encode(message));
	return Array.from(new Uint8Array(hashBuffer))
		.map(byte => byte.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * @param {string} ch
 * @returns {boolean}
 */
export function isDigit(ch) {
	return ch.length === 1 && "0123456789".includes(ch);
}
