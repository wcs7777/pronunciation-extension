import IpaSource from "./ipasource.js";

/**
 * @implements {IpaSource}
 */
export default class ISTranslatorMind extends IpaSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptIpatranslatorMind} options
	 * @param {?PronunciationSourceLastError} lastError
	 */
	constructor(pi, options, lastError) {
		super(pi, options, lastError);
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "translatorMind";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ISTranslatorMind.name;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async fetch() {
		const input = this.pi.input;
		const response = await fetch("https://translatormind.com/wp-admin/admin-ajax.php", {
			method: "POST",
			credentials: "omit",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
			body: new URLSearchParams({
				action: "do_translation",
				translator_nonce: "b07b3ae4de",
				post_id: "280",
				to_translate: input,
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
		 * 	success: boolean,
		 * 	data: string,
		 * }}
		 */
		const jsonResponse = await response.json();
		if (!jsonResponse.success) {
			throw {
				status: 401,
				message: `Not found ${input}`,
				error: new Error(`Not found ${input}`),
			};
		}
		return (
			jsonResponse.data.startsWith('/') ?
			jsonResponse.data :
			`/${jsonResponse.data}/`
		);
	}

}
