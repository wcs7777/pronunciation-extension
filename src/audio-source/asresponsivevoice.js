import { url2blob } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-source.js";

/**
 * @implements {AudioSource}
 */
export default class ASResponsiveVoice {

	/**
	 * @param {OptAudioResponsiveVoice} options
	 */
	constructor(options) {
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
		let enabled = false;
		if (!toText) {
			enabled = this.options.enabled;
		} else {
			enabled = (
				this.options.enabledToText &&
				input.length <= this.options.textMaxLength
			);
		}
		return enabled && !waitRateLimit(lastError, 60, [200, 404]);
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
