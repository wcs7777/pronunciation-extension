import IpaSource from "./ipasource.js";

/**
 * @type {PronunciationSource}
 */
export default class ISUnalengua extends IpaSource {
  /**
   * @param {PronunciationSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {OptIpaUnalengua} */
    const options = params.options;
    this.options = options;
  }

  /**
   * @returns {Promise<string>}
   */
  async fetch() {
    const input = this.pi.input;
    const response = await fetch("https://api2.unalengua.com/ipav3", {
      method: "POST",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lang: "en-US",
        mode: true,
        text: input,
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
     * @type {{
     * 	detected: string,
     * 	ipa: string,
     * 	lang: string,
     * 	spelling: string,
     * }}
     */
    const jsonResponse = await response.json();
    return `/${jsonResponse.ipa}/`;
  }
}

