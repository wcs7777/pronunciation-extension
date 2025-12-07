import AudioSource from "./audiosource.js";
import { url2blob } from "../../utils/fetch.js";

/**
 * @implements {AudioSource}
 */
export default class ASGstatic extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioGstatic} options
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
		return "gstatic";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASGstatic.name;
	}

	/**
	 * @returns {boolean} Fetch only valid words
	 */
	get onlyValid() {
		return true;
	}

	/**
	 * @returns {Promise<Blob>}
	 */
	async fetch() {
		const input = this.pi.input;
		const base = "https://ssl.gstatic.com/dictionary/static/sounds";
		const fileBegin = input.replaceAll("'", "_");
		/** @type {string[]} */
		let candidates = [];
		for (const date of ["20200429", "20220808"]) {
			const candidatesDate = [
				"--1_us_1.mp3",
				"--_us_1.mp3",
				"--_us_1_rr.mp3",
				"--_us_2.mp3",
				"--_us_2_rr.mp3",
				"--_us_3.mp3",
				"--_us_3_rr.mp3",
				"_--1_us_1.mp3",
			].map(fileEnd => `${base}/${date}/${fileBegin}${fileEnd}`);
			candidates = candidates.concat(candidatesDate);
		}
		return Promise.any(candidates.map(url => url2blob(url)));
	}

}
