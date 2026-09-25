import AudioSource from "./audiosource.js";
import { url2base64 } from "../../utils/fetch.js";

/**
 * @type {PronunciationSource}
 */
export default class ASGoogleSpeech extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioGoogleSpeech} */
    const options = params.options;
    this.options = options;
  }

  /**
   * @returns {Promise<string>}
   */
  fetch() {
    const input = this.pi.input;
    const endpoint = "https://www.google.com/speech-api/v1/synthesize?";
    const params = new URLSearchParams({
      text: input,
      enc: "mpeg",
      lang: "en",
      speed: 0.5,
      client: "lr-language-tts",
      use_google_only_voices: 1,
    }).toString();
    return url2base64(`${endpoint}${params}`);
  }
}

