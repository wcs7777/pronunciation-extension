import AudioSource from "./audiosource.js";

/**
 * @implements {AudioSource}
 */
export default class ASPlayHt extends AudioSource {

	/**
	 * @param {OptAudioPlayHt} options
	 */
	constructor(options) {
		super(options);
		this.options = options;
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
		return ASPlayHt.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationSourceLastError} lastError
	 * @returns {boolean}
	 */
	enabled(input, toText, lastError) {
		if (!this.options.api.userId || !this.options.api.key) {
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
