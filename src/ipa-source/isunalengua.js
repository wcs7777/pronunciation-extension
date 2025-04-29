import IpaSource from "./ipasource.js";

/**
 * @implements {IpaSource}
 */
export default class ISUnalengua extends IpaSource {

	/**
	 * @param {OptIpaUnalengua} options
	 */
	constructor(options) {
		super(options);
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
		return ISUnalengua.name;
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
