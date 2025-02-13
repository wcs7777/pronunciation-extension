import { splitWords } from "../utils/string.js";
import { url2blob, url2document } from "../utils/element.js";

export default class AFGoogleDefine {

	constructor() {
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "googleDefine";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFGoogleDefine.name;
	}

	/**
	 * @returns {number}
	 */
	get order() {
		return 2;
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
		return false; // does not work anymore
	}

	/**
	 * @param {string} text
	 * @returns {Promise<Blob>}
	 */
	async fetch(text) {
		const params = new URLSearchParams({
			hl: "en",
			gl: "US",
			q: `define:${text}`,
		}).toString();
		const document = await url2document(`${base}${params}`);
		const hdw = document.querySelector("span[data-dobid='hdw']");
		if (!hdw) {
			throw new Error(`hdw not found for ${text}`);
		}
		const defineWord = splitWords(text).shift().replaceAll("·", "");
		if (defineWord !== text.replaceAll("-", " ")) {
			throw new Error(
				`define text is different of text (${defineWord} != ${text})`
			);
		}
		const source = document.querySelector("audio[jsname='QInZvb'] source");
		if (!source) {
			throw new Error(`Audio source not found for ${text}`);
		}
		const src = source.getAttribute("src");
		if (!src) {
			throw new Error(`src not found for ${text}`);
		}
		const url = src.startsWith("https://") ? src : `https://${src}`;
		return url2blob(url);
	}

}
