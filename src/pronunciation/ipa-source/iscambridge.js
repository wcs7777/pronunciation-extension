import IpaSource from "./ipasource.js";
import { url2document } from "../../utils/fetch.js";

/**
 * @type {PronunciationSource}
 */
export default class ISCambridge extends IpaSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptIpaCambridge} */
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
   * @returns {boolean} Fetch only words in root form
   */
  get onlyRoot() {
    return true;
  }

  /**
   * @returns {Promise<string>}
   */
  async fetch() {
    const input = this.pi.input;
    const endpoint = "https://dictionary.cambridge.org/us/dictionary/english/";
    const document = await url2document(`${endpoint}${input}`);
    const entry = document.querySelector(".entry:has(.ipa)");
    if (!entry) {
      throw new Error(`Entry not found for ${input}`);
    }
    const hw = entry.querySelector(".hw.dhw");
    if (!hw) {
      throw new Error(`hd not foudn for ${input}`);
    }
    if (hw.textContent.toLowerCase() !== input) {
      throw new Error(`${input} is different from ${hw.textContent}`);
    }
    const ipa = document.querySelector("span.ipa");
    if (!ipa?.textContent) {
      throw new Error(`ipa not found for ${input}`);
    }
    return `/${ipa.textContent}/`;
  }
}

