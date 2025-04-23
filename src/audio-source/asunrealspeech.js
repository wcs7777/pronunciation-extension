import { waitRateLimit } from "../utils/pronunciation-source.js";

/**
 * @implements {AudioSource}
 */
export default class ASUnrealSpeech {

	/**
	 * @param {OptAudioUnrealSpeech} options
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "unrealSpeech";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASUnrealSpeech.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationSourceLastError} lastError
	 * @returns {boolean}
	 */
	enabled(input, toText, lastError) {
		if (!this.options.api.token) {
			return false;
		}
		let enabled = false;
		if (!toText) {
			enabled = this.options.enabled;
		} else {
			enabled = (
				this.options.enabledToText &&
				input.length <= this.options.textMaxLength
			);
		}
		return enabled && !waitRateLimit(lastError, 60 * 2, [200, 404]);
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
	async fetch(input, analysis) {
		const base = "https://api.v7.unrealspeech.com";
		let endpoint = "";
		let body = {
			Text: input,
			VoiceId: this.options.api.voiceId,
			Bitrate: this.options.api.bitRate,
			Speed: 0,
			Pitch: this.options.api.pitch,
		};
		if (input.length <= 1000) {
			endpoint = "stream";
			body = {
				...body,
				Codec: this.options.api.codec,
				Temperature: this.options.api.temperature,
			};
		} else {
			endpoint = "speech";
			body = {
				...body,
			  TimestampType: "sentence",
			};
		}
		const response = await fetch(`${base}/${endpoint}`, {
			method: "POST",
			credentials: "omit",
			headers: {
				"Authorization": `Bearer ${this.options.api.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
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
