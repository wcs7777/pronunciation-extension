import { url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

export default class IFOxford {

	/**
	 * @param {OptIpaOxford} options
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
		return "oxford";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return IFOxford.name;
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
		const base = "https://www.oxfordlearnersdictionaries.com/us/definition/english/";
		const document = await url2document(`${base}${text}`);
		const headword = document.querySelector("h1.headword");
		if (!headword) {
			throw new Error(`headword not found for ${text}`);
		}
		if (headword.textContent != text) {
			throw new Error(`${text} is different from ${headword.textContent}`);
		}
		const phon = document.querySelector("div.phons_n_am span.phon");
		if (!phon?.textContent) {
			throw new Error(`phon not found for ${text}`);
		}
		return phon.textContent;
	}

}
