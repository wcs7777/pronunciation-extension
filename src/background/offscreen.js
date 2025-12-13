import * as as from "../pronunciation/audio-source/sources.js";
import * as is from "../pronunciation/ipa-source/sources.js";
import PronunciationInput from "../pronunciation/pronunciation-input.js";
import { addLoudnessLimiter } from "../utils/audio.js";
import { blob2base64 } from "../utils/element.js";
import { threshold } from "../utils/number.js";
import { removeMethods } from "../utils/object.js";

if (!chrome.runtime.onMessage.hasListener(onMessage)) {
	chrome.runtime.onMessage.addListener(onMessage);
}

/**
 * @type{IpaSource[]}
 */
const ipaSources = [
	is.ISCambridge,
	is.ISOxford,
	is.ISTranslatorMind,
	is.ISUnalengua,
];
/**
 * @type{AudioSource[]}
 */
const audioSources = [
	as.ASAmazonPolly,
	as.ASCambridge,
	as.ASDeepSeek,
	as.ASElevenLabs,
	as.ASGoogleSpeech,
	as.ASGstatic,
	as.ASLinguee,
	as.ASOpenAi,
	as.ASOxford,
	as.ASPlayHt,
	as.ASResponsiveVoice,
	as.ASSpeechify,
	as.ASUnrealSpeech,
];

/**
 * @param {OffscreenMessage} message
 * @param {browser.runtime.MessageSender} sender
 * @param {(any) => void} sendResponse
 * @returns {boolean}
 */
function onMessage(message, sender, sendResponse) {
	if (message.target !== "offscreen") {
		return false;
	}
	const actions = {
		"fetchIpaExternally": fetchIpaExternally,
		"fetchAudioExternally": fetchAudioExternally,
		"playAudio": playAudio,
	};
	if (!message.type in actions) {
		throw new Error(`Invalid message type: ${message.type}`);
	}
	actions[message.type](message)
		.then(sendResponse)
		.catch(console.error);
	return true;
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<fetchExternallyReturn>}
 */
async function fetchIpaExternally(message) {
	if (!message.fetchIpaExternally) {
		throw new Error("Should pass fetchIpaExternally options in message");
	}
	const {
		options,
		rawInput,
		allowText,
		sourcesLastError: le,
	} = message.fetchIpaExternally;
	/** @type {string[]} */
	const showLe = [];
	const now = new Date();
	const datetime = now.toISOString();
	const timestamp = now.getTime();
	const pi = new PronunciationInput(rawInput, allowText);
	const analysis = await pi.analysis();
	const isValid = analysis.isValid;
	const isRoot = analysis.root === pi.firstWord;
	/** @type {IpaSource[]} */
	const sources = ipaSources
		.map(S => new S(pi, options.sources[S.name], le[S.name]))
		.filter(s => {
			return (
				s.enabled &&
				(isValid || !s.onlyValid) &&
				(isRoot || !s.onlyRoot)
			);
		})
		.sort((l, r) => l.order - r.order);
	for (const s of sources) {
		try {
			console.log(`Searching IPA in ${s.name}`);
			const ipa = await s.fetch();
			if (ipa) {
				console.log(`IPA found in ${s.name}`);
				return {
					value: ipa,
					save: s.save,
					le,
					showLe,
				};
			}
		} catch (error) {
			console.error(error);
			/** @type {PronunciationSourceLastError} */
			const lastError = {
				source: s.name,
				datetime,
				status: error?.status,
				timestamp,
				message: error?.message,
				messageContentType: error?.messageContentType,
				error: removeMethods(error?.error ?? error),
			};
			le[s.name] = lastError;
			if (
				options.showSourceLastError &&
				error?.status &&
				error.status !== 404
			) {
				showLe.push(`${s.name}: ${error.status}`);
			}
		}
	}
	return {
		value: null,
		save: false,
		le,
		showLe,
	};
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<fetchExternallyReturn>}
 */
async function fetchAudioExternally(message) {
	if (!message.fetchAudioExternally) {
		throw new Error("Should pass fetchAudioExternally options in message");
	}
	const {
		options,
		rawInput,
		allowText,
		sourcesLastError: le,
	} = message.fetchAudioExternally;
	/** @type {string[]} */
	const showLe = [];
	const now = new Date();
	const datetime = now.toISOString();
	const timestamp = now.getTime();
	const pi = new PronunciationInput(rawInput, allowText);
	const analysis = await pi.analysis();
	const isValid = analysis.isValid;
	const isRoot = analysis.root === pi.firstWord;
	/** @type {AudioSource[]} */
	const sources = audioSources
		.map(S => new S(pi, options.sources[S.name], le[S.name]))
		.filter(s => {
			return (
				s.enabled &&
				(isValid || !s.onlyValid) &&
				(isRoot || !s.onlyRoot)
			);
		})
		.sort((l, r) => l.order - r.order);
	for (const s of sources) {
		try {
			console.log(`Searching audio in ${s.name}`);
			const audio = await s.fetch();
			if (audio) {
				console.log(`Audio found in ${s.name}`);
				return {
					value: await blob2base64(audio),
					save: s.save,
					le,
					showLe,
				};
			}
		} catch (error) {
			console.error(error);
			/** @type {PronunciationSourceLastError} */
			const lastError = {
				source: s.name,
				datetime,
				status: error?.status,
				timestamp,
				message: error?.message,
				messageContentType: error?.messageContentType,
				error: removeMethods(error?.error ?? error),
			};
			le[s.name] = lastError;
			if (
				options.showSourceLastError &&
				error?.status &&
				error.status !== 404
			) {
				showLe.push(`${s.name}: ${error.status}`);
			}
		}
	}
	return {
		value: null,
		save: false,
		le,
		showLe,
	};
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<void>}
 */
async function playAudio(message) {
	if (!message.playAudio) {
		throw new Error("Should pass playAudio options in message");
	}
	const {
		url,
		options,
	} = message.playAudio;
	try {
		const audio = new Audio(url);
		audio.volume = threshold(0, 1, options.volume);
		audio.playbackRate = threshold(0.2, 2.0, options.playbackRate);
		if (options.limitLoudness) {
			await addLoudnessLimiter(audio).play();
		} else {
			await audio.play();
		}
	} catch (error) {
		console.error("Play audio error", error);
	}
}
