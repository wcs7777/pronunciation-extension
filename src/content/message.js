import IpaPopup from "../utils/ipa-popup.js";
import { showPopup } from "../utils/show-popup.js";
import {
	addAudioSource,
	setAudioControlShortcuts,
	toggleAudioControlShortcuts,
	toggleAudioPlayer,
} from "../utils/audio-player.js";

if (!browser.runtime.onMessage.hasListener(onMessage)) {
	browser.runtime.onMessage.addListener(onMessage);
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<string | void>}
 */
async function onMessage(message) {
	const actions = {
		"showIpa": showIpa,
		"getSelectedText": getSelectedText,
		"playAudio": playAudio,
		"showPopup": showPopupFromBackground,
	};
	if (!message.type in actions) {
		throw new Error(`Invalid message type: ${message.type}`);
	}
	const value = await actions[message.type](message);
	return value;
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<void>}
 */
async function showIpa(message) {
	const popup = new IpaPopup(
		message.showIpa.ipa,
		message.showIpa.options,
		message.origin,
	);
	return popup.show();
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<string>}
 */
async function getSelectedText(message) {
	return window.getSelection().toString();
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<void>}
 */
async function playAudio(message) {
	const options = message.playAudio;
	if (!options) {
		throw new Error("Should pass playAudio options in message");
	}
	try {
		setAudioControlShortcuts(options.shortcuts);
		toggleAudioControlShortcuts({
			forceEnable: options.shortcutsEnabled,
			forceDisable: !options.shortcutsEnabled,
		});
		if (options.source) {
			await addAudioSource(options.source, { play: true });
			await toggleAudioPlayer({
				forceEnable: options.playerEnabled,
				forceDisable: !options.playerEnabled,
			});
		} else if (!options.playerEnabled) {
			await toggleAudioPlayer({ forceDisable: true });
		}
	} catch (error) {
		toggleAudioControlShortcuts({ forceDisable: true });
		await toggleAudioPlayer({ forceDisable: true });
		console.error(error);
	}
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<void>}
 */
async function showPopupFromBackground(message) {
	const options = message.showPopup;
	if (!options) {
		throw new Error("Should pass showPopup options in message");
	}
	showPopup(options);
}
