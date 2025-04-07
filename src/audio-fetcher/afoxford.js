import { textHierarchy } from "../utils/string.js";
import { url2blob } from "../utils/element.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFOxford {

	constructor() {
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "oxford";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFOxford.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationFetcherLastError} lastError
	 * @returns {boolean}
	 */
	enabled(input, toText, lastError) {
		return !toText;
	}

	/**
	 * @param {boolean} toText
	 * @returns {number}
	 */
	order(toText) {
		return !toText ? 1 : 0;
	}

	/**
	 * @returns {boolean}
	 */
	get save() {
		return true;
	}

	/**
	 * @returns {boolean}
	 */
	get saveError() {
		return false;
	}

	/**
	 * @param {string} input
	 * @returns {Promise<Blob>}
	 */
	fetch(input) {
		const base = "https://www.oxfordlearnersdictionaries.com/us/media/english/us_pron_ogg";
		const fileBegin = input.replaceAll("'", "_").replaceAll("-", "_");
		const candidates = [
			"__us_1.ogg",
			"__us_1_rr.ogg",
		].map(fileEnd => {
			const file = `${fileBegin}${fileEnd}`;
			const path = textHierarchy(file, [1, 3, 5]).join("/");
			return `${base}/${path}/${file}`;
		});
		return Promise.any(candidates.map(url => url2blob(url)));
	}

}
