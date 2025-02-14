import { url2blob } from "../utils/element.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFGstatic {

	constructor() {
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "gstatic";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFGstatic.name;
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
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(toText) {
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
	 * @param {string} text
	 * @returns {Promise<Blob>}
	 */
	fetch(text) {
		const base = "https://ssl.gstatic.com/dictionary/static/sounds/20200429";
		const fileBegin = text.replaceAll("'", "_");
		const candidates = [
			"--1_us_1.mp3",
			"--_us_1.mp3",
			"--_us_1_rr.mp3",
			"--_us_2.mp3",
			"--_us_2_rr.mp3",
			"--_us_3.mp3",
			"--_us_3_rr.mp3",
			"_--1_us_1.mp3",
		].map(fileEnd => `${base}/${fileBegin}${fileEnd}`);
		return Promise.any(candidates.map(url => url2blob(url)));
	}

}
