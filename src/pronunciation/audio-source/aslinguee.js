import AudioSource from "./audiosource.js";
import { splitWords } from "../../utils/string.js";
import { url2blob, url2document } from "../../utils/fetch.js";

const urlPattern = /(https:\/\/assets\.linguee\.com\/static\/[\w-]+\/mp3\/EN_US\/\w+\/[\w-]+.*?)"/;

/**
 * @implements {AudioSource}
 */
export default class ASLinguee extends AudioSource {

	/**
	 * @param {PronunciationInput} pi
	 * @param {OptAudioLinguee} options
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
		return "linguee";
	}

	/**
	 * @returns {string}
	 */
	get name() {
		return ASLinguee.name;
	}

	/**
	 * @returns {boolean} Fetch only valid words
	 */
	get onlyValid() {
		return true;
	}

	/**
	 * @returns {Promise<Blob>}
	 */
	async fetch() {
		const input = this.pi.input;
		const endpoint = "https://www.linguee.com/english-spanish/search";
		const params = new URLSearchParams({
			source: "english",
			query: input,
		}).toString();
		const document = await url2document(`${endpoint}?${params}`);
		const title = splitWords(
			document.querySelector("a.dictLink")?.innerHTML ?? "",
		)[0];
		if (title.toLowerCase() !== input) {
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
