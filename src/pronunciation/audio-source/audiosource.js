import { waitRateLimit } from "../utils/wait-rate-limit.js";

export default class AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {PronunciationSourceOptions} options
	 * @param {?PronunciationSourceLastError} lastError
	 */
	constructor(pi, options, lastError) {
		this.pi = pi;
		this.options = options;
		this.lastError = lastError;
	}

	/**
	 * @returns {boolean}
	 */
	get enabled() {
		let enabled = false;
		if (!this.pi.isText) {
			enabled = this.options.enabled;
		} else {
			enabled = (
				this.options.enabledToText &&
				this.pi.length <= this.options.textMaxLength
			);
		}
		const shouldWait = waitRateLimit(
			this.lastError,
			this.options.waitRateLimitTimeout,
			this.options.okStatus,
		);
		return enabled && !shouldWait;
	}

	/**
	 * @returns {number}
	 */
	get order() {
		return (
			!this.pi.isText ?
			this.options.order :
			this.options.orderToText
		);
	}

	/**
	 * @returns {boolean}
	 */
	get save() {
		return this.options.save;
	}

}
