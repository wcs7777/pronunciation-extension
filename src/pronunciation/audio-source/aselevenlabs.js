import AudioSource from "./audiosource.js";

/**
 * @type {PronunciationSource}
 */
export default class ASElevenLabs extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioElevenLabs} */
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
    const base = "https://api.elevenlabs.io/v1/text-to-speech";
    const endpoint = `${base}/${this.options.api.voiceId}/stream?`;
    const queryParams = new URLSearchParams({
      output_format: this.options.api.outputFormat,
    }).toString();
    const response = await fetch(`${endpoint}${queryParams}`, {
      method: "POST",
      credentials: "omit",
      headers: {
        "xi-api-key": this.options.api.key,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({
        text: input,
        model_id: this.options.api.modelId,
        apply_text_normalization: this.options.api.applyTextNormalization,
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

