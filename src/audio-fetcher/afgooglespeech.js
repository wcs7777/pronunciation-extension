import { url2blob } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFGoogleSpeech {

	/**
	 * @param {OptAudioGoogleSpeech} options
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "googleSpeech";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFGoogleSpeech.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationFetcherLastError} lastError
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
		return enabled && !waitRateLimit(lastError, 10, [200, 404]);
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
	 * @param {boolean} toText
	 * @returns {number}
	 */
	order(toText) {
		return !toText ? this.options.order : this.options.orderToText;
	}

	/**
	 * @param {string} input
	 * @returns {Promise<Blob>}
	 */
	fetch(input) {
		const endpoint = "https://www.google.com/speech-api/v1/synthesize?";
		const params = new URLSearchParams({
			text: input,
			enc: "mpeg",
			lang: "en",
			speed: 0.5,
			client: "lr-language-tts",
			use_google_only_voices: 1,
		}).toString();
		return url2blob(`${endpoint}${params}`);
	}

}
