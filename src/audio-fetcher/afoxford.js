import { splitWords } from "../utils/string.js";
import { url2blob, url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFOxford {

	/**
	 * @param {OptAudioOxford} options
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
		return AFOxford.name;
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
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<string>}
	 */
	async fetch(input, analysis) {
		if (!analysis.isValid) {
			throw new Error(`${input} probably is not a valid word`);
		}
		const word = analysis.isVerb ? analysis.root : input;
		const base = "https://www.oxfordlearnersdictionaries.com/us/definition/english/";
		const document = await url2document(`${base}${word}`);
		const button = document.querySelector(
			`div.sound.audio_play_button.pron-us[title^="${input} "]`,
		);
		if (!button) {
			throw new Error(`audio_play_button not found for ${input}`);
		}
		const title = splitWords(button?.title.trim().toLowerCase())?.[0];
		if (title.toLowerCase() !== input) {
			throw new Error(`${input} is different from ${title}`);
		}
		const src = button.dataset?.srcOgg;
		if (!src) {
			throw new Error(`Audio not found for ${input}`);
		}
		const url = (
			src.startsWith("https://") ?
			src :
			`${window.location.origin}${src}`
		);
		return url2blob(url);
	}

}
