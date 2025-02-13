import { textHierarchy } from "../utils/string.js";
import { url2blob } from "../utils/element.js";

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
	 * @returns {number}
	 */
	get order() {
		return 1;
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
	 * @returns {boolean}
	 */
	get enabled() {
		return true;
	}

	/**
	 * @param {string} text
	 * @returns {Promise<Blob>}
	 */
	fetch(text) {
		const base = "https://www.oxfordlearnersdictionaries.com/us/media/english/us_pron_ogg";
		const fileBegin = text.replaceAll("'", "_").replaceAll("-", "_");
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
