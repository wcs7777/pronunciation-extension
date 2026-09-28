import { directoryPartitioning, splitWords } from "../../utils/string.js";
import { createTabAndGetData } from "../../utils/tabs.js";
import AudioSource from "./audiosource.js";

/**
 * @type {PronunciationSource}
 */
export default class ASCambridge extends AudioSource {
  #attempts = 0;
  #searchUrl = false;

  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioCambridge} */
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
      let url = "";
      if (!this.#searchUrl) {
        const partitioning = directoryPartitioning(input);
        url = `${base}/us/media/english-portuguese/us_pron/${partitioning}/${input}.mp3`;
      } else {
        url = `${base}/us/dictionary/english/${input}`;
        const text = await createTabAndGetData(
          {
            url,
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
        const rawWord = entry
          .querySelector(".hw.dhw")
          .textContent.trim()
          .toLowerCase();
        const word = splitWords(rawWord)[0];
        if (word.toLowerCase() != input) {
          throw new Error(`Word (${word}) different from input ${input}`);
        }
        const src = document
          .querySelector("span.us audio source")
          ?.getAttribute("src");
        if (!src) {
          throw new Error(`Audio not found for ${word}`);
        }
        url = src.startsWith("https://") ? src : `${base}${src}`;
      }
      return await createTabAndGetData(
        {
          url,
          active: false,
          muted: true,
          index: 100,
        },
        "audio/mpeg",
      );
    } catch (error) {
      this.#attempts++;
      if (this.#attempts > 3) {
        throw error;
      }
      if (error?.status === 403) {
        return this.fetch();
      }
      if (error?.status === 404 && !this.#searchUrl) {
        this.#searchUrl = true;
        return this.fetch();
      }
      throw error;
    }
  }
}
