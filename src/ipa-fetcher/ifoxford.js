import { url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";
import { splitWords } from "../utils/string.js";

/**
 * @implements {IpaFetcher}
 */
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
	 * @param {string} text
	 * @returns {Promise<string>}
	 */
	async fetch(text) {
		const base = "https://www.oxfordlearnersdictionaries.com/us/definition/english/";
		const document = await url2document(`${base}${text}`);
		const button = document.querySelector(
			`div.sound.audio_play_button.pron-us[title^="${text} "]`,
		);
		if (!button) {
			throw new Error(`audio_play_button not found for ${text}`);
		}
		const title = splitWords(button?.title.trim().toLowerCase())?.[0];
		if (title !== text) {
			throw new Error(`${text} is different from ${title}`);
		}
		return button.nextElementSibling.textContent;
	}

}
