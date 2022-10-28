import {
	$,
	untilResolve,
	replaceQuotesByUnderline,
	url2base64,
	url2document,
	url2audio,
	isString,
	normalizeWord,
	promiseTimeoutReject,
} from "./utils.js";

const speech = "s";
const fail = false;

export async function pronunciationAudio(
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
	let audio = await audioFromTable(word, audioTable, googleSpeechSpeed)
		.catch((error) => {
			if (error !== fail) {
				throw error;
			}
			return error;
		});
	if (!audio) {
		let src = undefined;
		try {
			audio = await untilResolve([
				() => {
					return audioFromTimeout(
						audioFromOxford,
						fetchFileAudioTimeout,
					);
				},
				() => {
					return audioFromTimeout(
						audioFromGstatic,
						fetchFileAudioTimeout,
					);
				},
				() => {
					return audioFromTimeout(
						audioFromGoogleDefine,
						fetchScrapAudioTimeout,
					);
				},
			]);
			src = audio.src;
		} catch (errors) {
			audio = await audioFromGoogleSpeech(word, googleSpeechSpeed);
			if (!errors.includes(isTooManyRequests)) {
				src = speech;
			}

			function isTooManyRequests(error) {
				return !isNaN(error) && parseInt(error, 10) === 429;
			}
		}
		await setAudio(word, src, audioTable);
	}
	console.timeEnd(`playAudio - ${word}`);
	return audio ? play(audio, audioVolume) : false;

	function audioFromTimeout(audioFromFn, timeout, ...args) {
		return promiseTimeoutReject(audioFromFn(word, ...args), timeout, false);
	}
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

export async function play(audio, volume) {
	if (0 <= volume && volume <= 1) {
		audio.volume = volume;
	}
	await audio.play();
	return audio.src;
}

async function audioFromTable(word, audioTable) {
	const url = await audioTable.get(word);
	if (!url) {
		throw fail;
	}
	return url !== speech ? url2audio(url) : audioFromGoogleSpeech(word);
}

async function audioFromGoogleSpeech(word, googleSpeechSpeed=0.5) {
	const base = "https://www.google.com/speech-api/v1/synthesize?";
	const params = new URLSearchParams({
		text: word,
		enc: "mpeg",
		lang: "en",
		speed: googleSpeechSpeed,
		client: "lr-language-tts",
		use_google_only_voices: 1,
	}).toString();
	return url2audio(base + params);
}

async function audioFromGstatic(word) {
	const base = (
		"https://ssl.gstatic.com/dictionary/static/sounds/20200429/"
	);
	const fileBegin = replaceQuotesByUnderline(word);
	return Promise.any([
		url2audio(`${base}${fileBegin}--_us_1.mp3`),
		url2audio(`${base}${fileBegin}--_us_2.mp3`),
		url2audio(`${base}${fileBegin}--_us_3.mp3`),
		url2audio(`${base}${fileBegin}--_us_1_rr.mp3`),
		url2audio(`${base}${fileBegin}--_us_2_rr.mp3`),
		url2audio(`${base}${fileBegin}--_us_3_rr.mp3`),
		url2audio(`${base}x${fileBegin}--_us_1.mp3`),
		url2audio(`${base}x${fileBegin}--_us_2.mp3`),
		url2audio(`${base}${fileBegin}_--1_us_1.mp3`),
		url2audio(`${base}_${fileBegin}--1_us_1.mp3`),
	]);
}

async function audioFromOxford(word) {
	return url2audio(
		buildOxfordAudioUrlPath(
			replaceQuotesByUnderline(word),
		),
	);
}

async function audioFromGoogleDefine(word) {
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
	return url2audio(!src.startsWith("http") ? "https:" + src : src);
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
