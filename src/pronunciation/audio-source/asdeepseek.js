import AudioSource from "./audiosource.js";

/**
 * @implements {AudioSource}
 */
export default class ASDeepSeek extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioDeepSeek} options
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
		return "deepSeek";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASDeepSeek.name;
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
		const endpoint = "https://api.deepinfra.com/v1/openai/audio/speech";
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
