import { url2blob } from "../utils/element.js";

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
	 * @returns {number}
	 */
	get order() {
		return this.options.order;
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
	 * @returns {boolean}
	 */
	get enabled() {
		const okStatus = [200, 404];
		const status = this.lastError?.status;
		if (status && !okStatus.includes(status)) {
			const now = new Date().getTime();
			if (now - this.lastError.timestamp < 3600000) { // 1 hour
				return false;
			}
		}
		return this.options.enabled;
	}

	/**
	 * @param {string} text
	 * @returns {Promise<Blob>}
	 */
	fetch(text) {
		const base = "https://www.google.com/speech-api/v1/synthesize?";
		const params = new URLSearchParams({
			text: text,
			enc: "mpeg",
			lang: "en",
			speed: 0.5,
			client: "lr-language-tts",
			use_google_only_voices: 1,
		}).toString();
		return url2blob(`${base}${params}`);
	}

}
