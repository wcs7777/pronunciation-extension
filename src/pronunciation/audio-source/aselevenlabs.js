import AudioSource from "./audiosource.js";

/**
 * @implements {AudioSource}
 */
export default class ASElevenLabs extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioElevenLabs} options
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
		return "elevenLabs";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASElevenLabs.name;
	}

	/**
	 * @returns {boolean}
	 */
	get enabled() {
		if (!this.options.api.key) {
			return false;
		}
		return super.enabled;
	}

	/**
	 * @returns {Promise<Blob>}
	 */
	async fetch() {
		const input = this.pi.input;
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
