import { cachedAnalyseWord } from "./utils/analyse-word.js";
import {
	generateSha1,
	removeExtraSpaces,
	splitWords,
} from "../utils/string.js";

/**
 * @implements {PronunciationInput}
 */
export default class PronunciationInput {

	#raw = null;
	#allowText = null;
	#firstWord = null;
	#text = null;
	#words = null;
	#length = null;
	#analysis = null;
	#key = null;

	/**
	 * @param {string} raw
	 * @param {boolean} allowText
	 * @returns {void}
	 */
	constructor(raw, allowText) {
		this.#raw = raw;
		this.#allowText = allowText;
	}

	/**
	 * @returns {string}
	 */
	get input() {
		return !this.isText ? this.firstWord : this.text;
	}

	/**
	 * @returns {string}
	 */
	get firstWord() {
		if (this.#firstWord) {
			return this.#firstWord;
		}
		this.#firstWord = this.words[0].toLowerCase();
		return this.#firstWord;
	}

	/**
	 * @returns {string}
	 */
	get text() {
		if (this.#text) {
			return this.#text;
		}
		this.#text = removeExtraSpaces(this.#raw);
		return this.#text;
	}

	/**
	 * @returns {string[]}
	 */
	get words() {
		if (this.#words) {
			return this.#words;
		}
		this.#words = splitWords(this.text);
		return this.#words;
	}

	/**
	 * @returns {number}
	 */
	get length() {
		if (this.#length) {
			return this.#length;
		}
		this.#length = (
			!this.isText ?
			this.firstWord.length :
			this.text.length
		);
		return this.#length;
	}

	/**
	 * @returns {number}
	 */
	get totalWords() {
		return this.words.length;
	}

	/**
	 * @returns {boolean}
	 */
	get hasWords() {
		return this.totalWords > 0;
	}

	/**
	 * @returns {boolean}
	 */
	get isText() {
		return this.#allowText && this.words.length > 1;
	}

	/**
	 * @returns {Promise<WordAnalyse>}
	 */
	async analysis() {
		if (this.#analysis) {
			return this.#analysis;
		}
		if (!this.isText) {
			this.#analysis = await cachedAnalyseWord(this.firstWord);
		} else {
			this.#analysis = {
				root: "",
				confidence: 1,
				type: "Text",
				isNoun: false,
				isVerb: false,
				isValid: true,
				isText: true,
			};
		}
		return this.#analysis;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async key() {
		if (this.#key) {
			return this.#key;
		}
		this.#key = await generateSha1(this.text);
		return this.#key;
	}

	/**
	 * @returns {string}
	 */
	get raw() {
		return this.#raw;
	}

}
