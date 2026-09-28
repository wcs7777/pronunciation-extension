import IpaSource from "./ipasource.js";
import { createTabAndGetData } from "../../utils/tabs.js";

/**
 * @type {PronunciationSource}
 */
export default class ISCambridge extends IpaSource {
  #attempts = 0;

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
    const base = "https://dictionary.cambridge.org";
    try {
      const text = await createTabAndGetData(
        {
          url: `${base}/us/dictionary/english/${input}`,
          active: false,
          muted: true,
          index: 100,
        },
        "text/html",
      );
      const document = new DOMParser().parseFromString(text, "text/html");
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
    } catch (error) {
      this.#attempts++;
      if (this.#attempts > 2) {
        throw error;
      }
      if (error?.status === 403) {
        return this.fetch();
      }
      throw error;
    }
  }
}
