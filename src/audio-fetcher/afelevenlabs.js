import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFElevenLabs {

	/**
	 * @param {OptAudioElevenLabs} options
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
		return "elevenLabs";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFElevenLabs.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(input, toText) {
		if (!this.options.api.key) {
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
		return enabled && !waitRateLimit(this.lastError, 60 * 2, [200, 404]);
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
	async fetch(input) {
		const base = "https://api.elevenlabs.io/v1/text-to-speech";
		const endpoint = `${base}/${this.options.api.voiceId}/stream?`;
		const queryParams = new URLSearchParams({
			output_format: this.options.api.outputFormat,
		}).toString();
		const response = await fetch(`${endpoint}${queryParams}`, {
			method: "POST",
			credentials: "omit",
			headers: {
				"xi-api-key": this.options.api.key,
				"Content-Type": "application/json",
				"Accept": "*/*",
			},
			body: JSON.stringify({
				text: input,
				model_id: this.options.api.modelId,
				apply_text_normalization: (
					this.options.api.applyTextNormalization
				),
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
		return response.blob();
	}

}
