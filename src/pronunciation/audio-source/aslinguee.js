import AudioSource from "./audiosource.js";
import { splitWords } from "../../utils/string.js";
import { url2base64, url2document } from "../../utils/fetch.js";

const urlPattern =
  /(https:\/\/assets\.linguee\.com\/static\/[\w-]+\/mp3\/EN_US\/\w+\/[\w-]+.*?)"/;

/**
 * @type {PronunciationSource}
 */
export default class ASLinguee extends AudioSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptAudioLinguee} */
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
    const endpoint = "https://www.linguee.com/english-spanish/search";
    const params = new URLSearchParams({
      source: "english",
      query: input,
    }).toString();
    const document = await url2document(`${endpoint}?${params}`);
    const title = splitWords(
      document.querySelector("a.dictLink")?.innerHTML ?? "",
    )[0];
    if (title.toLowerCase() !== input) {
      throw new Error(`${input} is different from ${title}`);
    }
    const onclick = document
      .querySelector("a.audio[onclick]")
      ?.getAttribute("onclick");
    if (!onclick) {
      throw new Error("Audio onclick not found");
    }
    const url = onclick.match(urlPattern)?.[1];
    if (!url) {
      throw new Error("Audio url not found");
    }
    return url2base64(`${url}.mp3`);
  }
}

