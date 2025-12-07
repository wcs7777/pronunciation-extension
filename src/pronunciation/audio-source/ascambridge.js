import AudioSource from "./audiosource.js";
import { splitWords } from "../../utils/string.js";
import { url2blob, url2document } from "../../utils/fetch.js";

/**
 * @implements {AudioSource}
 */
export default class ASCambridge extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioCambridge} options
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
		return "cambridge";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASCambridge.name;
	}

	/**
	 * @returns {boolean} Fetch only valid words
	 */
	get onlyValid() {
		return true;
	}

	/**
	 * @returns {boolean} Fetch only words in root form
	 */
	get onlyRoot() {
		return true;
	}

	/**
	 * @returns {Promise<Blob>}
	 */
	async fetch() {
		const input = this.pi.input;
		const endpoint = "https://dictionary.cambridge.org/us/dictionary/english/";
		const document = await url2document(`${endpoint}${input}`);
		const entry = document.querySelector(".entry:has(.ipa)");
		if (!entry) {
			throw new Error(`Entry not found for ${input}`);
		}
		const rawWord = entry
			.querySelector(".hw.dhw")
			.textContent
			.trim()
			.toLowerCase();
		const word = splitWords(rawWord)[0];
		console.log({ word });
		if (word.toLowerCase() != input) {
			throw new Error(`Word (${word}) different from input ${input}`);
		}
		const src = document
			.querySelector("span.us audio source")
			?.getAttribute("src");
		if (!src) {
			throw new Error(`Audio not found for ${word}`);
		}
		const url = (
			src.startsWith("https://") ?
			src :
			`https://dictionary.cambridge.org${src}`
		);
		return url2blob(url);
	}

}
