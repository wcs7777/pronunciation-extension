import { url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";
import { splitWords } from "../utils/string.js";

/**
 * @implements {IpaFetcher}
 */
export default class IFOxford {

	/**
	 * @param {OptIpaOxford} options
	 */
	constructor(options) {
		this.options = options;
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
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationFetcherLastError} lastError
	 * @returns {boolean}
	 */
	enabled(input, toText, lastError) {
		let enabled = false;
		if (!toText) {
			enabled = this.options.enabled;
		} else {
			enabled = (
				this.options.enabledToText &&
				input.length <= this.options.textMaxLength
			);
		}
		return enabled && !waitRateLimit(lastError, 10, [200, 404]);
	}

	/**
	 * @param {boolean} toText
	 * @returns {number}
	 */
	order(toText) {
		return !toText ? this.options.order : this.options.orderToText;
	}

	/**
	 * @returns {boolean}
	 */
	get save() {
		return this.options.save;
	}

	/**
	 * @returns {boolean}
	 */
	get saveError() {
		return this.options.saveError;
	}

	/**
	 * @param {string} input
	 * @returns {Promise<string>}
	 */
	async fetch(input) {
		const base = "https://www.oxfordlearnersdictionaries.com/us/definition/english/";
		const document = await url2document(`${base}${input}`);
		const button = document.querySelector(
			`div.sound.audio_play_button.pron-us[title^="${input} "]`,
		);
		if (!button) {
			throw new Error(`audio_play_button not found for ${input}`);
		}
		const title = splitWords(button?.title.trim().toLowerCase())?.[0];
		if (title !== input) {
			throw new Error(`${input} is different from ${title}`);
		}
		return button.nextElementSibling.textContent;
	}

}
