import AudioSource from "./audiosource.js";
import { url2base64 } from "../../utils/fetch.js";

/**
 * @type {PronunciationSource}
 */
export default class ASGstatic extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioGstatic} */
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
    const base = "https://ssl.gstatic.com/dictionary/static/sounds";
    const fileBegin = input.replaceAll("'", "_");
    /** @type {string[]} */
    let candidates = [];
    for (const date of ["20200429", "20220808"]) {
      const candidatesDate = [
        "--1_us_1.mp3",
        "--_us_1.mp3",
        "--_us_1_rr.mp3",
        "--_us_2.mp3",
        "--_us_2_rr.mp3",
        "--_us_3.mp3",
        "--_us_3_rr.mp3",
        "_--1_us_1.mp3",
      ].map((fileEnd) => `${base}/${date}/${fileBegin}${fileEnd}`);
      candidates = candidates.concat(candidatesDate);
    }
    return Promise.any(candidates.map((url) => url2base64(url)));
  }
}

