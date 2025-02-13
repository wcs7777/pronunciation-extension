import { url2blob } from "../utils/element.js";

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
	 * @returns {number}
	 */
	get order() {
		return this.options.order;
	}

	/**
	 * @returns {boolean}
	 */
	get save() {
		return true;
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
		const base = "https://texttospeech.responsivevoice.org/v1/text:synthesize?";
		const params = new URLSearchParams({
			lang: "en-US",
			engine: "g1",
			name: this.options.api.name,
			pitch: "0.5",
			rate: "0.5",
			volume: "1",
			key: this.options.api.key,
			gender: this.options.api.gender,
			text: text,
		}).toString();
		return url2blob(`${base}${params}`);
	}

}
