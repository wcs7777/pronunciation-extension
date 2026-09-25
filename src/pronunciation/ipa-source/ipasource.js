import { waitRateLimit } from "../utils/wait-rate-limit.js";

/**
 * @type {PronunciationSource}
 */
export default class IpaSource {
  /** @type {string} */
  #name = "abstract";

  /**
   * @param {PronunciationSourceParams} params
   */
  constructor({ name, pi, options, tabId, lastError }) {
    this.#name = name;
    this.pi = pi;
    this.options = options;
    this.tabId = tabId;
    this.lastError = lastError;
  }

  /**
   * @returns {string}
   */
  get name() {
    return this.#name;
  }

  /**
   * @returns {boolean}
   */
  get enabled() {
    let enabled = false;
    if (!this.pi.isText) {
      enabled = this.options.enabled;
    } else {
      enabled =
        this.options.enabledToText &&
        this.pi.input.length <= this.options.textMaxLength;
    }
    const shouldWait = waitRateLimit(
      this.lastError,
      this.options.waitRateLimitTimeout,
      this.options.okStatus,
    );
    return enabled && !shouldWait;
  }

  /**
   * @returns {boolean} Fetch only valid words
   */
  get onlyValid() {
    return false;
  }

  /**
   * @returns {boolean} Fetch only words in root form
   */
  get onlyRoot() {
    return false;
  }

  /**
   * @returns {number}
   */
  get order() {
    return !this.pi.isText ? this.options.order : this.options.orderToText;
  }

  /**
   * @returns {boolean}
   */
  get save() {
    return this.options.save;
  }
}
