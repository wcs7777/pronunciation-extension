import { blob2base64 } from "../../utils/element.js";
import AudioSource from "./audiosource.js";

/**
 * @type {PronunciationSource}
 */
export default class ASDeepSeek extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioDeepSeek} */
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
  async fetch() {
    const input = this.pi.input;
    const endpoint = "https://api.deepinfra.com/v1/openai/audio/speech";
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${this.options.api.key}`,
        "Content-Type": "application/json",
        Accept: "*/*",
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
    return blob2base64(await response.blob());
  }
}

