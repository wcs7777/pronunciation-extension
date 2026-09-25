import { blob2base64 } from "../../utils/element.js";
import AudioSource from "./audiosource.js";

/**
 * @type {PronunciationSource}
 */
export default class ASPlayHt extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioPlayHt} */
    const options = params.options;
    this.options = options;
  }

  /**
   * @returns {boolean}
   */
  get enabled() {
    if (!this.options.api.userId || !this.options.api.key) {
      return false;
    }
    return super.enabled;
  }

  /**
   * @returns {Promise<string>}
   */
  async fetch() {
    const input = this.pi.input;
    const endpoint = "https://api.play.ht/api/v2/tts/stream";
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${this.options.api.key}`,
        "X-User-ID": this.options.api.userId,
        "Content-Type": "application/json",
        Accept: "*/*",
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
    return blob2base64(await response.blob());
  }
}

