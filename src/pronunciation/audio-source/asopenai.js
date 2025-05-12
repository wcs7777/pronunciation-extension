import AudioSource from "./audiosource.js";

/**
 * @implements {AudioSource}
 */
export default class ASOpenAi extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioOpenAi} options
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
		return "openAi";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASOpenAi.name;
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
		const endpoint = "https://api.openai.com/v1/audio/speech";
		const response = await fetch(endpoint, {
			method: "POST",
			credentials: "omit",
			headers: {
				"Authorization": `Bearer ${this.options.api.key}`,
				"Content-Type": "application/json",
				"Accept": "*/*",
			},
			body: JSON.stringify({
				model: this.options.api.model,
				input: input,
				voice: this.options.api.voice,
				response_format: this.options.api.responseFormat,
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
