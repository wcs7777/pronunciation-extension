import AFGstatic from "./afgstatic.js";
import AFOxford from "./afoxford.js";
import { resolveTimeout } from "../utils/promise.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {AudioFetcher}
 */
export default class AFRealVoice {

	/**
	 * @param {OptAudioRealVoice} options
	 */
	constructor(options) {
		this.options = options;
		this.oxford = new AFOxford();
		this.gstatic = new AFGstatic();
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "realVoice";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFRealVoice.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationFetcherLastError} lastError
	 * @returns {boolean}
	 */
	enabled(input, toText, lastError) {
		let enabled = false;
		if (!toText) {
			enabled = this.options.enabled;
		} else {
			enabled = (
				this.options.enabledToText &&
				input.length <= this.options.textMaxLength
			);
		}
		return enabled && !waitRateLimit(lastError, 10, [200, 404]);
	}

	/**
	 * @param {boolean} toText
	 * @returns {number}
	 */
	order(toText) {
		return !toText ? this.options.order : this.options.orderToText;
	}

	/**
	 * @returns {boolean}
	 */
	get save() {
		return this.options.save;
	}

	/**
	 * @returns {boolean}
	 */
	get saveError() {
		return this.options.saveError;
	}

	/**
	 * @param {string} input
	 * @returns {Promise<Blob>}
	 */
	fetch(input) {
		/**
		 * @type {Promise<Blob>[]}
		 */
		const promises = [
			resolveTimeout(this.options.fetchTimeout, null),
		];
		if (this.oxford.enabled) {
			promises.push(this.oxford.fetch(input));
		}
		if (this.gstatic.enabled) {
			promises.push(this.gstatic.fetch(input));
		}
		return Promise.any(promises);
	}

}
