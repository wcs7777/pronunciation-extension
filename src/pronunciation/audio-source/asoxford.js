import AudioSource from "./audiosource.js";
import { directoryPartitioning, splitWords } from "../../utils/string.js";
import { url2base64, url2document } from "../../utils/fetch.js";

/**
 * @type {PronunciationSource}
 */
export default class ASOxford extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioOxford} */
    const options = params.options;
    this.options = options;
  }

  /**
   * @returns {boolean} Fetch only valid words
   */
  get onlyValid() {
    return true;
  }

  /**
   * @returns {Promise<string>}
   */
  async fetch() {
    const input = this.pi.input;
    const base = "https://www.oxfordlearnersdictionaries.com";
    const fileName = `${input}__us_1.mp3`;
    const partitioning = directoryPartitioning(fileName);
    try {
      await url2base64(
        `${base}/us/media/english/us_pron/${partitioning}/${fileName}`,
      );
    } catch (error) {
      console.error(error?.status);
    }
    const analysis = await this.pi.analysis();
    const word = analysis.isVerb ? analysis.root : input;
    const document = await url2document(
      `${base}/us/definition/english/${word}`,
    );
    const button = document.querySelector(
      `div.sound.audio_play_button.pron-us[title^="${input} "]`,
    );
    if (!button) {
      throw new Error(`audio_play_button not found for ${input}`);
    }
    const title = splitWords(button?.title.trim().toLowerCase())?.[0];
    if (title.toLowerCase() !== input) {
      throw new Error(`${input} is different from ${title}`);
    }
    const src = button.dataset?.srcMp3;
    if (!src) {
      throw new Error(`Audio not found for ${input}`);
    }
    const url = src.startsWith("https://") ? src : `${base}${src}`;
    return url2base64(url);
  }
}
