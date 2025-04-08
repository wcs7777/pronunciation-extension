import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {IpaFetcher}
 */
export default class IFUnalengua {

	/**
	 * @param {OptIpaUnalengua} options
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "unalengua";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return IFUnalengua.name;
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
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<string>}
	 */
	async fetch(input, analysis) {
		const response = await fetch("https://api2.unalengua.com/ipav3", {
			method: "POST",
			credentials: "omit",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				"lang": "en-US",
				"mode": true,
				"text": input,
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
