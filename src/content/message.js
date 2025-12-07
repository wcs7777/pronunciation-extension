import IpaPopup from "../utils/ipa-popup.js";
import { optionsTable } from "../utils/storage-tables.js";
import { showPopup } from "../utils/show-popup.js";
import {
	changeOptions as changeAlertMaxSelectionOptions,
} from "../utils/alert-max-selection.js";
import {
	addAudioSource,
	changeSkipSeconds,
	setAudioControlShortcuts,
	toggleAudioControlShortcuts,
	toggleAudioPlayer,
} from "../utils/audio-player.js";

if (!browser.runtime.onMessage.hasListener(onMessage)) {
	browser.runtime.onMessage.addListener(onMessage);
}

/**
 * @param {ClientMessage} message
 * @param {browser.runtime.MessageSender} sender
 * @param {(any) => void} sendResponse
 * @returns {boolean}
 */
function onMessage(message, sender, sendResponse) {
	if (message.target !== "client") {
		return false;
	}
	const actions = {
		"showIpa": showIpa,
		"getSelectedText": getSelectedText,
		"getIpaPosition": getIpaPosition,
		"playAudio": playAudio,
		"showPlayer": showPlayer,
		"showPopup": showPopupFromBackground,
		"changeAlertMaxSelectionOptions": changeAlertMaxSelectionOptionsCB,
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
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function showIpa(message) {
	const options = message.showIpa;
	if (!options) {
		throw new Error("Should pass showIpa options in message");
	}
	const popup = new IpaPopup(
		options.ipa,
		options.position,
		options.options,
	);
	return popup.show();
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<string>}
 */
async function getSelectedText(message) {
	return document.getSelection().toString();
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<PopupPosition>}
 */
async function getIpaPosition(message) {
	const options = message.getIpaPosition;
	if (!options) {
		throw new Error("Should pass getIpaPosition options in message");
	}
	const s = window.getSelection();
	if (s.rangeCount === 0) {
		return {
			centerHorizontally: true,
			centerVertically: true,
		};
	}
	const { top, left } = s.getRangeAt(0).getBoundingClientRect();
	let shiftTimes = -1.9;
	if (
		(
			(message.origin === "menuItem") &&
			(options.optionPosition.menuTriggered === "below")
		) ||
		(
			(message.origin === "action") &&
			(options.optionPosition.actionTriggered === "below")
		)
	) {
		shiftTimes = 2.5;
	}
	return {
		centerHorizontally: false,
		centerVertically: false,
		top: top + options.fontSize * shiftTimes,
		left,
	};
}

/**
 * @param {ClientMessage} message
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
		changeSkipSeconds(options.skipSeconds);
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
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function showPlayer(message) {
	try {
		await toggleAudioPlayer({ forceEnable: true });
	} catch (error) {
		toggleAudioControlShortcuts({ forceDisable: true });
		await toggleAudioPlayer({ forceDisable: true });
		console.error(error);
	}
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function showPopupFromBackground(message) {
	const options = message.showPopup;
	if (!options) {
		throw new Error("Should pass showPopup options in message");
	}
	showPopup(options);
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function changeAlertMaxSelectionOptionsCB(message) {
	const options = message.changeAlertMaxSelectionOptions;
	if (!options) {
		throw new Error(
			"Should pass changeAlertMaxSelectionOptionsoptions in message"
		);
	}
	changeAlertMaxSelectionOptions(options);
}

(async () => {
	/** @type {Options} */
	const options = await optionsTable.getAll();
	changeAlertMaxSelectionOptions({
		enabled: options.alertMaxSelectionEnabled,
		maxLength: options.alertMaxSelectionLength,
	});
})().catch(console.error);
