import AudioSource from "./audiosource.js";

/**
 * @type {PronunciationSource}
 */
export default class ASSpeechify extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioSpeechify} */
    const options = params.options;
    this.options = options;
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
   * @returns {Promise<string>}
   */
  async fetch() {
    const input = this.pi.input;
    const endpoint = "https://api.sws.speechify.com/v1/audio/speech";
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${this.options.api.token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
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
    return jsonResponse.audio_data;
  }
}

