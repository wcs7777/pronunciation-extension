import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

export default class IFUnalengua {

	/**
	 * @param {OptIpaUnalengua} options
	 * @param {?PronunciationFetcherLastError} lastError
	 */
	constructor(options, lastError) {
		this.options = options;
		this.lastError = lastError;
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
	 * @returns {number}
	 */
	get order() {
		return this.options.order;
	}

	/**
	 * @returns {boolean}
	 */
	get save() {
		return true;
	}

	/**
	 * @returns {boolean}
	 */
	get saveError() {
		return true;
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
	 * @returns {Promise<string>}
	 */
	async fetch(text) {
		const response = await fetch("https://api2.unalengua.com/ipav3", {
			method: "POST",
			credentials: "omit",
			body: JSON.stringify({
				"lang": "en-US",
				"mode": true,
				"text": text,
			}),
		});
		const status = response.status;
		if (status !== 200) {
			const message = await response.text();
			throw {
				status,
				message,
				error: new Error("Fetch error"),
			};
		}
		const jsonResponse = await response.json();
		const ipa = jsonResponse["ipa"];
		return `/${ipa}/`;
	}

}
