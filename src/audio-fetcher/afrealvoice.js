import AFGstatic from "./afgstatic.js";
import AFOxford from "./afoxford.js";
import { resolveTimeout } from "../utils/promise.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

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
	 * @returns {number}
	 */
	get order() {
		return this.options.order;
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
	 * @returns {boolean}
	 */
	get enabled() {
		return (
			this.options.enabled &&
			!waitRateLimit(this.lastError, 10, [200, 404])
		);
	}

	/**
	 * @param {string} text
	 * @returns {Promise<Blob>}
	 */
	fetch(text) {
		/**
		 * @type {Promise<Blob>[]}
		 */
		const promises = [
			resolveTimeout(this.options.fetchTimeout, null),
		];
		if (this.oxford.enabled) {
			promises.push(this.oxford.fetch(text));
		}
		if (this.gstatic.enabled) {
			promises.push(this.gstatic.fetch(text));
		}
		return Promise.any(promises);
	}

}
