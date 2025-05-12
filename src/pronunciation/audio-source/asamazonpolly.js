import AudioSource from "./audiosource.js";
import { fetchAws } from "../../utils/aws-sign-v4.js";

/**
 * @implements {AudioSource}
 */
export default class ASAmazonPolly extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioAmazonPolly} options
	 * @param {?PronunciationSourceLastError} lastError
	 */
	constructor(pi, options, lastError) {
		super(pi, options, lastError);
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
	 * @returns {boolean}
	 */
	get enabled() {
		if (
			!this.options.api.accessKeyId ||
			!this.options.api.secretAccessKey
		) {
			return false;
		}
		return super.enabled;
	}

	/**
	 * @returns {Promise<Blob>}
	 */
	async fetch() {
		const input = this.pi.input;
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
