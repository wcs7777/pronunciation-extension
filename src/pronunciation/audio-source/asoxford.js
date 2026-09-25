import AudioSource from "./audiosource.js";
import { splitWords } from "../../utils/string.js";
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
    const analysis = await this.pi.analysis();
    const word = analysis.isVerb ? analysis.root : input;
    const base =
      "https://www.oxfordlearnersdictionaries.com/us/definition/english/";
    const document = await url2document(`${base}${word}`);
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
    const src = button.dataset?.srcOgg;
    if (!src) {
      throw new Error(`Audio not found for ${input}`);
    }
    const url = src.startsWith("https://")
      ? src
      : `${window.location.origin}${src}`;
    return url2base64(url);
  }
}

