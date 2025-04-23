import { waitRateLimit } from "../utils/pronunciation-source.js";

/**
 * @implements {IpaSource}
 */
export default class ISAntvaset {

	/**
	 * @param {OptIpaAntvaset} options
	 */
	constructor(options) {
		this.options = options;
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
		return ISAntvaset.name;
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
		const endpoint = "https://www.antvaset.com/api";
		const response = await fetch(endpoint, {
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
