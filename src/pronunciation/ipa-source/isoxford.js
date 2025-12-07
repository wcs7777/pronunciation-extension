import IpaSource from "./ipasource.js";
import { url2document } from "../../utils/fetch.js";
import { splitWords } from "../../utils/string.js";

/**
 * @implements {IpaSource}
 */
export default class ISOxford extends IpaSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptIpaOxford} options
	 * @param {?PronunciationSourceLastError} lastError
	 */
	constructor(pi, options, lastError) {
		super(pi, options, lastError);
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
		return ISOxford.name;
	}

	/**
	 * @returns {boolean} Fetch only valid words
	 */
	get onlyValid() {
		return true;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async fetch() {
		const input = this.pi.input;
		const analysis = await this.pi.analysis();
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
		return button.nextElementSibling.textContent;
	}

}
