import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFPlayHt {

	/**
	 * @param {OptAudioPlayHt} options
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
		return "playHt";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFPlayHt.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(input, toText) {
		if (!this.options.api.userId || !this.options.api.key) {
			return false;
		}
		let enabled = false;
		if (!toText) {
			enabled = this.options.enabled;
		} else {
			enabled = (
				this.options.enabledToText &&
				(
					input.length <= this.options.textMaxLength ||
					(
						this.options.api.voiceEngine === "Play3.0-mini" &&
						input.length <= 20000
					)
				)
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
	async fetch2(input) {
		const endpoint = "https://api.play.ht/api/v2/tts/stream";
		const response = await fetch(endpoint, {
			method: "POST",
			credentials: "omit",
			headers: {
				"Authorization": `Bearer ${this.options.api.key}`,
				"X-User-ID": this.options.api.userId,
				"Content-Type": "application/json",
				"Accept": "*/*",
			},
			body: JSON.stringify({
				text: input,
				quality: this.options.api.quality,
				output_format: this.options.api.outputFormat,
				sample_rate: this.options.api.sampleRate,
				// temperature: this.options.api.temperature,
				voice_engine: this.options.api.voiceEngine,
				language: "english",
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

	/**
	 * @param {string} input
	 * @returns {Promise<Blob>}
	 */
	async fetch(input) {
		const endpoint = "https://api.play.ht/api/v2/tts/stream";
		const response = await fetch(endpoint, {
			method: "POST",
			credentials: "omit",
			headers: {
				"Authorization": `Bearer ${this.options.api.key}`,
				"X-User-ID": this.options.api.userId,
				"Content-Type": "application/json",
				"Accept": "*/*",
			},
			body: JSON.stringify({
				text: input,
				voice: this.options.api.voiceId,
				quality: this.options.api.quality,
				output_format: this.options.api.outputFormat,
				sample_rate: this.options.api.sampleRate,
				temperature: this.options.api.temperature,
				voice_engine: this.options.api.voiceEngine,
				language: "english",
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
