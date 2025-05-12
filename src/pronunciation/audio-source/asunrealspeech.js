import AudioSource from "./audiosource.js";

/**
 * @implements {AudioSource}
 */
export default class ASUnrealSpeech extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioUnrealSpeech} options
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
		return "unrealSpeech";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASUnrealSpeech.name;
	}

	/**
	 * @returns {boolean}
	 */
	get enabled() {
		if (!this.options.api.token) {
			return false;
		}
		return super.enabled;
	}

	/**
	 * @returns {Promise<Blob>}
	 */
	async fetch() {
		const input = this.pi.input;
		const base = "https://api.v7.unrealspeech.com";
		let endpoint = "";
		let body = {
			Text: input,
			VoiceId: this.options.api.voiceId,
			Bitrate: this.options.api.bitRate,
			Speed: 0,
			Pitch: this.options.api.pitch,
		};
		if (input.length <= 1000) {
			endpoint = "stream";
			body = {
				...body,
				Codec: this.options.api.codec,
				Temperature: this.options.api.temperature,
			};
		} else {
			endpoint = "speech";
			body = {
				...body,
			  TimestampType: "sentence",
			};
		}
		const response = await fetch(`${base}/${endpoint}`, {
			method: "POST",
			credentials: "omit",
			headers: {
				"Authorization": `Bearer ${this.options.api.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
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
		return response.blob()
	}

}
