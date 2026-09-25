import AudioSource from "./audiosource.js";
import { url2base64 } from "../../utils/fetch.js";

/**
 * @type {PronunciationSource}
 */
export default class ASResponsiveVoice extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioResponsiveVoice} */
    const options = params.options;
    this.options = options;
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
   * @returns {Promise<string>}
   */
  fetch() {
    const input = this.pi.input;
    const endpoint =
      "https://texttospeech.responsivevoice.org/v1/text:synthesize?";
    const params = new URLSearchParams({
      lang: "en-US",
      engine: "g1",
      name: this.options.api.name,
      pitch: "0.5",
      rate: "0.5",
      volume: "1",
      key: this.options.api.key,
      gender: this.options.api.gender,
      text: input,
    }).toString();
    return url2base64(`${endpoint}${params}`);
  }
}

