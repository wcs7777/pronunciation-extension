import AudioSource from "./audiosource.js";
import { url2blob } from "../utils/fetch.js";

/**
 * @implements {AudioSource}
 */
export default class ASResponsiveVoice extends AudioSource {

	/**
	 * @param {OptAudioResponsiveVoice} options
	 */
	constructor(options) {
		super(options);
		this.options = options;
	 }

	/**
	 * @returns {string}
	 */
	static get name() {
		return "responsiveVoice";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASResponsiveVoice.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationSourceLastError} lastError
	 * @returns {boolean}
	 */
	enabled(input, toText, lastError) {
		if (!this.options.api.key) {
			return false;
		}
		return super.enabled(input, toText, lastError);
	}

	/**
	 * @param {string} input
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<Blob>}
	 */
	fetch(input, analysis) {
		const endpoint = "https://texttospeech.responsivevoice.org/v1/text:synthesize?";
		const params = new URLSearchParams({
			lang: "en-US",
			engine: "g1",
			name: this.options.api.name,
			pitch: "0.5",
			rate: "0.5",
			volume: "1",
			key: this.options.api.key,
			gender: this.options.api.gender,
			text: input,
		}).toString();
		return url2blob(`${endpoint}${params}`);
	}

}
