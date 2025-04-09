const wordPattern = /([A-Za-z\u00C0-\u024F\-']+)/g;
const digitPattern = /\d+/g;
const spacePattern = / +/g;
const newlinePattern = /(\r?\n)+/g;

/**
 * @param {string} text
 * @returns {string[]}
 */
export function splitWords(text) {
	// strangely some word matchs results in multiple words
	const hasSpace = spacePattern.test(text);
	const words = text
		.trim()
		.replaceAll("’", "'")
		.match(wordPattern)
	if (words) {
		return !hasSpace ? [words.join("")] : words;
	} else {
		return [];
	}
}

/**
 * Replace one or more spaces with one space
 * @param {string} text
 * @returns {string}
 */
export function removeExtraSpaces(text) {
	return text
		.replaceAll(spacePattern, " ")
		.replaceAll(newlinePattern, "\n");
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
 * @param {string} value
 * @returns {string}
 */
export function kebab2camel(value) {
	return value.replaceAll(
		/-+(.)/g,
		(_, p1) => p1.toUpperCase(),
	);
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
	const buffer = await crypto.subtle.digest(
		"SHA-1",
		new TextEncoder("utf-8").encode(message),
	);
	const array = [...new Uint8Array(buffer)];
	return array.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * @param {string} ch
 * @returns {boolean}
 */
export function isDigit(ch) {
	return ch.length === 1 && "0123456789".includes(ch);
}
