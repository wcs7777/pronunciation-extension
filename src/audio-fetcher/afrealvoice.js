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
	 * @param {?PronunciationFetcherLastError} lastError
	 */
	constructor(options, lastError) {
		this.options = options;
		this.lastError = lastError;
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
	 * @returns {boolean}
	 */
	get save() {
		const saveValues = [
			this.oxford.save,
			this.gstatic.save,
		];
		return saveValues.some(s => s);
	}

	/**
	 * @returns {boolean}
	 */
	get saveError() {
		const saveErrorValues = [
			this.oxford.saveError,
			this.gstatic.saveError,
		];
		return saveErrorValues.some(s => s);
	}

	/**
	 * @param {boolean} toText
	 * @returns {boolean}
	 */
	enabled(toText) {
		const enabled = (
			!toText ?
			this.options.enabled :
			this.options.enabledToText
		);
		return enabled && !waitRateLimit(this.lastError, 10, [200, 404]);
	}

	/**
	 * @param {boolean} toText
	 * @returns {number}
	 */
	order(toText) {
		return !toText ? this.options.order : this.options.orderToText;
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
