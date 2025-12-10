import { url2document } from "../../utils/fetch.js";
import IpaSource from "./ipasource.js";

/**
 * @implements {IpaSource}
 */
export default class ISTranslatorMind extends IpaSource {

	#attempts = 0;

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptIpaTranslatorMind} options
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
		if (this.#attempts > 3) {
			throw {
				status: 100,
				message: "Too many attempts of get nonce",
				error: new Error("Too many attempts of get nonce"),
			};
		}
		const input = this.pi.input;
		const response = await fetch("https://translatormind.com/wp-admin/admin-ajax.php", {
			method: "POST",
			credentials: "omit",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
			body: new URLSearchParams({
				action: "do_translation",
				translator_nonce: this.options.nonce,
				post_id: "280",
				to_translate: input,
			}),
		});
		const status = response.status;
		if (status === 403) {
			const document = await url2document(
				"https://translatormind.com/translator-tool/ipa-phonetic-transcription-translator/",
				"omit",
				true,
			);
			const nonce = document.getElementById("translator_nonce").value;
			console.log({ nonce });
			await browser.storage.session.set({ [this.name]: { nonce }});
			this.options.nonce = nonce;
			this.#attempts++;
			return this.fetch();
		} else if (status !== 200) {
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
		let ipa = jsonResponse.data;
		if (
			(ipa.startsWith('/') && ipa.endsWith('/')) ||
			(ipa.startsWith('[') && ipa.endsWith(']'))
		) {
			ipa = ipa.slice(1, -1);
		}
		return `/${ipa}/`;
	}

}
