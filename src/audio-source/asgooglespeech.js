import AudioSource from "./audiosource.js";
import { url2blob } from "../utils/fetch.js";

/**
 * @implements {AudioSource}
 */
export default class ASGoogleSpeech extends AudioSource {

	/**
	 * @param {OptAudioGoogleSpeech} options
	 */
	constructor(options) {
		super(options);
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "googleSpeech";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASGoogleSpeech.name;
	}

	/**
	 * @param {string} input
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<Blob>}
	 */
	fetch(input, analysis) {
		const endpoint = "https://www.google.com/speech-api/v1/synthesize?";
		const params = new URLSearchParams({
			text: input,
			enc: "mpeg",
			lang: "en",
			speed: 0.5,
			client: "lr-language-tts",
			use_google_only_voices: 1,
		}).toString();
		return url2blob(`${endpoint}${params}`);
	}

}
