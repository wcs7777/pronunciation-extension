import {
	$,
	untilResolve,
	replaceQuotesByUnderline,
	url2base64,
	url2document,
	isString,
	normalizeWord,
	promiseTimeoutReject,
} from "./utils.js";

const speech = "s";
const fail = false;

export async function playAudio(
	word,
	{
		audioTable,
		audioVolume=1.0,
		fetchFileAudioTimeout=2000,
		fetchScrapAudioTimeout=2000,
		googleSpeechSpeed=0.5,
	}={},
) {
	console.time(`playAudio - ${word}`);
	let playable = await canPlayFromTable(word, audioTable)
		.catch((error) => {
			if (error !== fail) {
				throw error;
			}
			return error;
		});
	if (!playable) {
		let audio = undefined;
		try {
			playable = await untilResolve([
				() => {
					return canPlayTimeout(
						canPlayFromOxford,
						fetchFileAudioTimeout,
					);
				},
				() => {
					return canPlayTimeout(
						canPlayFromGstatic,
						fetchFileAudioTimeout,
					);
				},
				() => {
					return canPlayTimeout(
						canPlayFromGoogleDefine,
						fetchScrapAudioTimeout,
						googleSpeechSpeed,
					);
				},
			]);
			audio = playable.src;
		} catch (errors) {
			playable = await canPlayFromGoogleSpeech(word);
			if (!errors.includes(isTooManyRequests)) {
				audio = speech;
			}

			function isTooManyRequests(error) {
				return !isNaN(error) && parseInt(error, 10) === 429;
			}
		}
		await setAudio(word, audio, audioTable);
	}
	console.timeEnd(`playAudio - ${word}`);
	return playable ? play(playable, audioVolume) : false;

	function canPlayTimeout(canPlayFn, timeout, ...args) {
		return promiseTimeoutReject(canPlayFn(word, ...args), timeout, false);
	}
}

export function canPlay(url) {
	return new Promise((resolve, reject) => {
		const audio = new Audio(url);
		audio.addEventListener("canplay", () => resolve(audio));
		audio.addEventListener("error", reject);
	});
}

export async function setAudio(word, audio, audioTable) {
	const value = (
		isUrl(audio) ? await url2base64(audio) : audio
	);
	await audioTable.set(word, value);
	const message = `${word} audio saved`;
	console.log(message);
	console.log(audio);
	return message;
}

export async function removeAudio(word, audioTable) {
	await audioTable.remove(word);
	const message = `${word} audio removed`;
	console.log(message);
	return message;
}

async function canPlayFromTable(word, audioTable) {
	const url = await audioTable.get(word);
	if (!url) {
		throw fail;
	}
	return url !== speech ? canPlay(url) : canPlayFromGoogleSpeech(word);
}

async function canPlayFromGoogleSpeech(word, googleSpeechSpeed=0.5) {
	const base = "https://www.google.com/speech-api/v1/synthesize?";
	const params = new URLSearchParams({
		text: word,
		enc: "mpeg",
		lang: "en",
		speed: googleSpeechSpeed,
		client: "lr-language-tts",
		use_google_only_voices: 1,
	}).toString();
	return canPlay(base + params);
}

async function canPlayFromGstatic(word) {
	const base = (
		"https://ssl.gstatic.com/dictionary/static/sounds/20200429/"
	);
	const fileBegin = replaceQuotesByUnderline(word);
	return Promise.any([
		canPlay(`${base}${fileBegin}--_us_1.mp3`),
		canPlay(`${base}${fileBegin}--_us_2.mp3`),
		canPlay(`${base}${fileBegin}--_us_3.mp3`),
		canPlay(`${base}${fileBegin}--_us_1_rr.mp3`),
		canPlay(`${base}${fileBegin}--_us_2_rr.mp3`),
		canPlay(`${base}${fileBegin}--_us_3_rr.mp3`),
		canPlay(`${base}x${fileBegin}--_us_1.mp3`),
		canPlay(`${base}x${fileBegin}--_us_2.mp3`),
		canPlay(`${base}${fileBegin}_--1_us_1.mp3`),
		canPlay(`${base}_${fileBegin}--1_us_1.mp3`),
	]);
}

async function canPlayFromOxford(word) {
	return canPlay(
		buildOxfordAudioUrlPath(
			replaceQuotesByUnderline(word),
		),
	);
}

async function canPlayFromGoogleDefine(word) {
	const base = "https://www.google.com/search?hl=en&gl=US&q=define%3A";
	const document = await url2document(base + word);
	const hdw = $("span[data-dobid='hdw']", document);
	if (!hdw || normalizeWord(hdw.textContent).replaceAll("·", "") !== word) {
		throw fail;
	}
	const source = $("audio[jsname='QInZvb'] source", document);
	if (!source) {
		throw fail;
	}
	const src = source.getAttribute("src");
	return canPlay(!src.startsWith("http") ? "https:" + src : src);
}

async function play(audio, volume=1.0) {
	audio.volume = volume;
	await audio.play();
	return audio.src;
}

function isUrl(value) {
	return isString(value) && value.startsWith("http");
}

function buildOxfordAudioUrlPath(fileBegin) {
	const file = fileBegin + "__us_1.ogg";
	const path = [
		file.slice(0, 1),
		file.slice(0, 3),
		file.slice(0, 5),
	].join("/");
	return [
		"https://www.oxfordlearnersdictionaries.com/us/media/english/us_pron_ogg",
		path,
		file,
	].join("/");
}
