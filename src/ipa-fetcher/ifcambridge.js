import { url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {IpaFetcher}
 */
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
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(toText) {
		const enabled = (
			!toText ?
			this.options.enabled :
			this.options.enabledToText
		);
		return enabled && !waitRateLimit(this.lastError, 10, [200, 404]);
	}

	/**
	 * @param {boolean} toText
	 * @returns {number}
	 */
	order(toText) {
		return !toText ? this.options.order : this.options.orderToText;
	}

	/**
	 * @param {string} input
	 * @returns {Promise<string>}
	 */
	async fetch(input) {
		const base = "https://dictionary.cambridge.org/us/dictionary/english/";
		const document = await url2document(`${base}${input}`);
		const hw = document.querySelector("span.hw.dhw");
		if (!hw) {
			throw new Error(`hd not foudn for ${input}`);
		}
		if (hw.textContent !== input) {
			throw new Error(`${input} is different from ${hw.textContent}`);
		}
		const ipa = document.querySelector("span.ipa");
		if (!ipa?.textContent) {
			throw new Error(`ipa not found for ${input}`);
		}
		return `/${ipa.textContent}/`;
	}

}
