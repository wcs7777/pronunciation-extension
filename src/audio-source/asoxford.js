import AudioSource from "./audiosource.js";
import { splitWords } from "../utils/string.js";
import { url2blob, url2document } from "../utils/fetch.js";

/**
 * @implements {AudioSource}
 */
export default class ASOxford extends AudioSource {

	/**
	 * @param {OptAudioOxford} options
	 */
	constructor(options) {
		super(options);
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
		return ASOxford.name;
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
