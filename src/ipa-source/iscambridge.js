import { url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-source.js";

/**
 * @implements {IpaSource}
 */
export default class ISCambridge {

	/**
	 * @param {OptIpaCambridge} options
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "cambridge";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ISCambridge.name;
	}

	/**
	 * @param {string} input
	 * @param {boolean} toText
	 * @param {?PronunciationSourceLastError} lastError
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
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<string>}
	 */
	async fetch(input, analysis) {
		if (
			!analysis.isValid ||
			(analysis.isVerb && analysis.root !== input)
		) {
			throw new Error(`${input} is not in root form`);
		}
		const base = "https://dictionary.cambridge.org/us/dictionary/english/";
		const document = await url2document(`${base}${input}`);
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
