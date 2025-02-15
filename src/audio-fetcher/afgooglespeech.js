import { url2blob } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFGoogleSpeech {

	/**
	 * @param {OptAudioGoogleSpeech} options
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
		return "googleSpeech";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFGoogleSpeech.name;
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
		return true;
	}

	/**
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(toText) {
		const enabled = (
			!toText ?
			this.options.enabled :
			this.options.enabledToText
		);
		return enabled && !waitRateLimit(this.lastError, 10, [200, 404]);
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
		const base = "https://www.google.com/speech-api/v1/synthesize?";
		const params = new URLSearchParams({
			text: input,
			enc: "mpeg",
			lang: "en",
			speed: 0.5,
			client: "lr-language-tts",
			use_google_only_voices: 1,
		}).toString();
		return url2blob(`${base}${params}`);
	}

}
