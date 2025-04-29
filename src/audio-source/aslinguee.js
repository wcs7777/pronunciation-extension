import AudioSource from "./audiosource.js";
import { splitWords } from "../utils/string.js";
import { url2blob, url2document } from "../utils/fetch.js";

const urlPattern = /(https:\/\/assets\.linguee\.com\/static\/[\w-]+\/mp3\/EN_US\/\w+\/[\w-]+.*?)"/;

/**
 * @implements {AudioSource}
 */
export default class ASLinguee extends AudioSource {

	/**
	 * @param {OptAudioLinguee} options
	 */
	constructor(options) {
		super(options);
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
	 * @param {string} input
	 * @param {WordAnalyse} analysis
	 * @returns {Promise<Blob>}
	 */
	async fetch(input, analysis) {
		if (!analysis.isValid) {
			throw new Error(`${input} probably is not a valid word`);
		}
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
