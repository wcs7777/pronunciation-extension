import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

/**
 * @implements {IpaFetcher}
 */
export default class IFAntvaset {

	/**
	 * @param {OptIpaAntvaset} options
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
		return "antvaset";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return IFAntvaset.name;
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
	 * @returns {Promise<string>}
	 */
	async fetch(input) {
		// const proxy = "https://proxy.cors.sh/";
		const proxy = "https://corsproxy.io/";
		const base = "https://www.antvaset.com/api";
		const response = await fetch(`${proxy}${base}`, {
			method: "POST",
			credentials: "omit",
			body: JSON.stringify({
				jsonrpc: "2.0",
				method: "ipaDictionary.query",
				params: {
					query: input,
					lang: "en"
				},
				id: 0,
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
		 * 	jsonrpc: string,
		 * 	result: {
		 * 		entries: {
		 * 			text: string,
		 * 			ipa: string,
		 * 		}[],
		 * 	},
		 * 	id: number,
		 * }}
		 */
		const jsonResponse = await response.json();
		const entries = jsonResponse.result.entries.map(e => `/${e.ipa}/`);
		if (entries.length === 0) {
			throw {
				status: 404,
				message: "Not found",
				error: new Error("Not found"),
			}
		}
		return entries.join(", ");
	}

}
