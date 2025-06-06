import IpaSource from "./ipasource.js";

/**
 * @implements {IpaSource}
 */
export default class ISAntvaset extends IpaSource {

	/**
	 * @param {OptIpaAntvaset} options
	 */
	constructor(options) {
		super(options);
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
