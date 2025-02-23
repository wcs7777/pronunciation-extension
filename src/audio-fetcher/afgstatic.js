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
	 * @param {string} input
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(input, toText) {
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
		const base = "https://ssl.gstatic.com/dictionary/static/sounds";
		const fileBegin = input.replaceAll("'", "_");
		/**
		 * @type {string[]}
		 */
		let candidates = [];
		for (const date of ["20200429", "20220808"]) {
			const candidatesDate = [
				"--1_us_1.mp3",
				"--_us_1.mp3",
				"--_us_1_rr.mp3",
				"--_us_2.mp3",
				"--_us_2_rr.mp3",
				"--_us_3.mp3",
				"--_us_3_rr.mp3",
				"_--1_us_1.mp3",
			].map(fileEnd => `${base}/${date}/${fileBegin}${fileEnd}`);
			candidates = candidates.concat(candidatesDate);
		}
		return Promise.any(candidates.map(url => url2blob(url)));
	}

}
