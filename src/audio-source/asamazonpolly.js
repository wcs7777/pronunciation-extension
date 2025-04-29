import AudioSource from "./audiosource.js";
import { fetchAws } from "../utils/aws-sign-v4.js";

/**
 * @implements {AudioSource}
 */
export default class ASAmazonPolly extends AudioSource {

	/**
	 * @param {OptAudioAmazonPolly} options
	 */
	constructor(options) {
		super(options);
		this.options = options;
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
		return ASAmazonPolly.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationSourceLastError} lastError
	 * @returns {boolean}
	 */
	enabled(input, toText, lastError) {
		if (
			!this.options.api.accessKeyId ||
			!this.options.api.secretAccessKey
		) {
			return false;
		}
		return super.enabled(input, toText, lastError);
	}

	/**
	 * @param {string} input
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<Blob>}
	 */
	async fetch(input, analysis) {
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
