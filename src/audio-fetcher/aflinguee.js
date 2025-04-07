import { splitWords } from "../utils/string.js";
import { url2blob, url2document } from "../utils/element.js";
import { waitRateLimit } from "../utils/pronunciation-fetcher.js";

const urlPattern = /(https:\/\/assets\.linguee\.com\/static\/[\w-]+\/mp3\/EN_US\/\w+\/[\w-]+.*?)"/;

/**
 * @implements {AudioFetcher}
 */
export default class AFLinguee {

	/**
	 * @param {OptAudioLinguee} options
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * @returns {string}
	 */
	static get name() {
		return "linguee";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return AFLinguee.name;
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
	 * @param {?WordAnalyse} analysis
	 * @returns {Promise<Blob>}
	 */
	async fetch(input, analysis) {
		if (analysis?.confidence < 0.5) {
			throw new Error(`${input} has not sufficient confidence ${analysis.confidence}`);
		}
		const endpoint = "https://www.linguee.com/english-spanish/search";
		const params = new URLSearchParams({
			source: "english",
			query: input,
		}).toString();
		const document = await url2document(`${endpoint}?${params}`);
		const title = splitWords(
			document.querySelector("a.dictLink")?.innerHTML,
		)?.[0];
		if (title !== input) {
			throw new Error(`${input} is different from ${title}`);
		}
		const onclick = document
			.querySelector("a.audio[onclick]")
			?.getAttribute("onclick");
		if (!onclick) {
			throw new Error("Audio onclick not found");
		}
		const url = onclick.match(urlPattern)?.[1];
		if (!url) {
			throw new Error("Audio url not found");
		}
		return url2blob(`${url}.mp3`);
	}

}
