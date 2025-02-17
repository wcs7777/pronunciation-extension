import { url2blob } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFResponsiveVoice {

	/**
	 * @param {OptAudioResponsiveVoice} options
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
		return "responsiveVoice";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFResponsiveVoice.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(input, toText) {
		let enabled = false;
		if (!toText) {
			enabled = this.options.enabled;
		} else {
			enabled = (
				this.options.enabledToText &&
				input.length <= this.options.textMaxLength
			);
		}
		return enabled && !waitRateLimit(this.lastError, 60, [200, 404]);
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
	 * @returns {Promise<Blob>}
	 */
	fetch(input) {
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
