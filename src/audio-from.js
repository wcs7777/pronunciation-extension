import { splitWords, textHierarchy } from "./utils/string.js";
import { url2audio, url2document } from "./utils/html.js";

/**
 * @param {string} word
 * @param {Table} table
 * @returns {Promise<HTMLAudioElement>}
 */
export async function audioFromTable(word, table) {
	const throwNotFound = true;
	return url2audio(await table.getValue(word, throwNotFound));
}

/**
 * @param {string} word
 * @param {MemoryCache} cache
 * @returns {Promise<HTMLAudioElement>}
 */
export async function audioFromCache(word, cache) {
	const throwNotFound = true;
	return url2audio(cache.get(word, throwNotFound));
}

/**
 * @param {string} word
 * @returns {Promise<HTMLAudioElement>}
 */
export async function audioFromGstatic(word) {
	const base = "https://ssl.gstatic.com/dictionary/static/sounds/20200429";
	const fileBegin = word.replaceAll("'", "_");
	const candidates = [
		"--1_us_1.mp3",
		"--_us_1.mp3",
		"--_us_1_rr.mp3",
		"--_us_2.mp3",
		"--_us_2_rr.mp3",
		"--_us_3.mp3",
		"--_us_3_rr.mp3",
		"_--1_us_1.mp3",
	].map(fileEnd => `${base}/${fileBegin}${fileEnd}`);
	return Promise.any(candidates.map(url => url2audio(url)));
}

/**
 * @param {string} word
 * @returns {Promise<HTMLAudioElement>}
 */
export async function audioFromOxford(word) {
	const base = "https://www.oxfordlearnersdictionaries.com/us/media/english/us_pron_ogg";
	const fileBegin = word.replaceAll("'", "_").replaceAll("-", "_");
	const candidates = [
		"__us_1.ogg",
		"__us_1_rr.ogg",
	].map(fileEnd => {
		const file = `${fileBegin}${fileEnd}`;
		const path = textHierarchy(file, [1, 3, 5]).join("/");
		return `${base}/${path}/${file}`;
	});
	return Promise.any(candidates.map(url => url2audio(url)));
}

/**
 * @param {string} word
 * @returns {Promise<HTMLAudioElement>}
 */
export async function audioFromGoogleDefine(word) {
	const base = "https://www.google.com/search?";
	const params = new URLSearchParams({
		hl: "en",
		gl: "US",
		q: `define:${word}`,
	}).toString();
	const document = await url2document(`${base}${params}`);
	const hdw = document.querySelector("span[data-dobid='hdw']");
	if (!hdw) {
		throw new Error(`hdw not found for ${word}`);
	}
	const defineWord = splitWords(word).shift().replaceAll("·", "");
	if (defineWord !== word.replaceAll("-", " ")) {
		throw new Error(
			`define word is different of word (${defineWord} != ${word})`
		);
	}
	const source = document.querySelector("audio[jsname='QInZvb'] source");
	if (!source) {
		throw new Error(`Audio source not found for ${word}`);
	}
	const src = source.getAttribute("src");
	if (!src) {
		throw new Error(`src not found for ${word}`);
	}
	const url = src.startsWith("https://") ? src : `https://${src}`;
	return url2audio(url);
}

/**
 * @param {string} word
 * @returns {Promise<HTMLAudioElement>}
 */
export async function audioFromGoogleSpeech(word) {
	const base = "https://www.google.com/speech-api/v1/synthesize?";
	const params = new URLSearchParams({
		text: word,
		enc: "mpeg",
		lang: "en",
		speed: 0.5,
		client: "lr-language-tts",
		use_google_only_voices: 1,
	}).toString();
	return url2audio(`${base}${params}`);
}

/**
 * @param {string} word
 * @param {ResponsiveVoiceOptions} options
 * @returns {Promise<HTMLAudioElement>}
 */
export async function audioFromResponsiveVoice(word, options={}) {
	const base = "https://texttospeech.responsivevoice.org/v1/text:synthesize?";
	const params = new URLSearchParams({
		lang: "en-US",
		engine: "g1",
		name: options.name ?? "rjs",
		pitch: "0.5",
		rate: "0.5",
		volume: "1",
		key: options.key ?? "O8Ic880z",
		gender: options.gender ?? "male",
		text: word,
	}).toString();
	return url2audio(`${base}${params}`);
}
