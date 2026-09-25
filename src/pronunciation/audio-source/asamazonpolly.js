import AudioSource from "./audiosource.js";
import { fetchAws } from "../../utils/aws-sign-v4.js";
import { blob2base64 } from "../../utils/element.js";

/**
 * @type {PronunciationSource}
 */
export default class ASAmazonPolly extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioAmazonPolly} */
    const options = params.options;
    this.options = options;
  }

  /**
   * @returns {boolean}
   */
  get enabled() {
    if (!this.options.api.accessKeyId || !this.options.api.secretAccessKey) {
      return false;
    }
    return super.enabled;
  }

  /**
   * @returns {Promise<string>}
   */
  async fetch() {
    const input = this.pi.input;
    const url = `https://${this.options.api.endpoint}/v1/speech`;
    const response = await fetchAws(
      url,
      {
        accessKeyId: this.options.api.accessKeyId,
        secretAccessKey: this.options.api.secretAccessKey,
        service: "polly",
      },
      {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          Engine: this.options.api.engine,
          LanguageCode: "en-US",
          OutputFormat: this.options.api.outputFormat,
          SampleRate: this.options.api.sampleRate,
          Text: input,
          TextType: "text",
          VoiceId: this.options.api.voiceId,
        }),
      },
    );
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

