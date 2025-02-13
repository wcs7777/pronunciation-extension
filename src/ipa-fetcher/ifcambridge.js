import { url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

export default class IFCambridge {

	/**
	 * @param {OptIpaCambridge} options
	 * @param {?PronunciationFetcherLastError} lastError
	 */
	constructor(options, lastError) {
		this.options = options;
		this.lastError = lastError;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "cambridge";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return IFCambridge.name;
	}

	/**
	 * @returns {number}
	 */
	get order() {
		return this.options.order;
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
		return true;
	}

	/**
	 * @returns {boolean}
	 */
	get enabled() {
		return (
			this.options.enabled &&
			!waitRateLimit(this.lastError, 10, [200, 404])
		);
	}

	/**
	 * @param {string} text
	 * @returns {Promise<string>}
	 */
	async fetch(text) {
		const base = "https://dictionary.cambridge.org/us/dictionary/english/";
		const document = await url2document(`${base}${text}`);
		const hw = document.querySelector("span.hw.dhw");
		if (!hw) {
			throw new Error(`hd not foudn for ${text}`);
		}
		if (hw.textContent !== text) {
			throw new Error(`${text} is different from ${hw.textContent}`);
		}
		const ipa = document.querySelector("span.ipa");
		if (!ipa?.textContent) {
			throw new Error(`ipa not found for ${text}`);
		}
		return `/${ipa.textContent}/`;
	}

}
