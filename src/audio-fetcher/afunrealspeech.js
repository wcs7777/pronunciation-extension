import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFUnrealSpeech {

	/**
	 * @param {OptAudioUnrealSpeech} options
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
		return "unrealspeech";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFUnrealSpeech.name;
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
		return (
			this.options.api.token &&
			enabled &&
			!waitRateLimit(this.lastError, 10, [200, 404])
		)
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
	async fetch(input) {
		const endpoint = "https://api.v7.unrealspeech.com/stream";
		const response = await fetch(endpoint, {
			method: "POST",
			credentials: "omit",
			headers: {
				"Authorization": `Bearer ${this.options.api.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				Text: input,
				VoiceId: this.options.api.voiceId,
				Bitrate: this.options.api.bitRate,
				Speed: 0,
				Pitch: this.options.api.pitch,
				Codec: this.options.api.codec,
				Temperature: this.options.api.temperature,
			}),
		});
		const status = response.status;
		if (status !== 200) {
			const message = await response.text();
			throw {
				status,
				message,
				error: new Error(response.statusText),
			};
		}
		return response.blob()
	}

}
