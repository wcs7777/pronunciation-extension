import AudioSource from "./audiosource.js";
import { base64ToBlob } from "../utils/element.js";

/**
 * @implements {AudioSource}
 */
export default class ASSpeechify extends AudioSource {

	/**
	 * @param {OptAudioSpeechify} options
	 */
	constructor(options) {
		super(options);
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "speechify";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASSpeechify.name;
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
		return super.enabled(input, toText, lastError);
	}

	/**
	 * @param {string} input
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<Blob>}
	 */
	async fetch(input, analysis) {
		const endpoint = "https://api.sws.speechify.com/v1/audio/speech";
		const response = await fetch(endpoint, {
			method: "POST",
			credentials: "omit",
			headers: {
				"Authorization": `Bearer ${this.options.api.token}`,
				"Content-Type": "application/json",
				"Accept": "*/*",
			},
			body: JSON.stringify({
				audio_format: "mp3",
				input: input,
				language: "en",
				model: "simba-english",
				voice_id: this.options.api.voiceId,
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
		/**
		 * @type{{ audio_data: string, audio_format: string }}
		 */
		const jsonResponse = await response.json();
		return base64ToBlob(jsonResponse.audio_data, "audio/mpeg");
	}

}
