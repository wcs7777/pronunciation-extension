import { fetchAws } from "../utils/aws-sign-v4.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFAmazonPolly {

	/**
	 * @param {OptAudioAmazonPolly} options
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
		return "amazonPolly";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFAmazonPolly.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(input, toText) {
		if (
			!this.options.api.accessKeyId ||
			!this.options.api.secretAccessKey
		) {
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
		return enabled && !waitRateLimit(this.lastError, 30, [200, 404]);
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
		const url = `https://${this.options.api.endpoint}/v1/speech`;
		const response = await fetchAws(url,
			{
				accessKeyId: this.options.api.accessKeyId,
				secretAccessKey: this.options.api.secretAccessKey,
				service: "polly",
			},
			{
				method: "POST",
				credentials: "omit",
				headers: {
					"Content-Type": "application/json",
					"Accept": "*/*",
				},
				body: JSON.stringify({
					Engine: this.options.api.engine,
					LanguageCode: "en-US",
					OutputFormat: this.options.api.outputFormat,
					SampleRate: this.options.api.sampleRate,
					Text: input,
					TextType: "text",
					VoiceId: this.options.api.voiceId,
				}),
			},
		);
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
