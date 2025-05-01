import defaultOptions from "../../utils/default-options.js";
import { byId, onlyShorcut, onlyNumber } from "../../utils/element.js";
import { getAllOptions, numOr, strOr, saveOptions, showInfo } from "./utils.js";

/**
 * @type {{
 *     enabled: HTMLInputElement,
 *     saveAudio: HTMLInputElement,
 *     playerEnabled: HTMLInputElement,
 *     shortcutsEnabled: HTMLInputElement,
 *     skipSeconds: HTMLInputElement,
 *     save: HTMLButtonElement,
 *     shortcuts: {
 *         togglePlayer: HTMLInputElement,
 *         togglePlay: HTMLInputElement,
 *         toggleMute: HTMLInputElement,
 *         rewind: HTMLInputElement,
 *         previous: HTMLInputElement,
 *         next: HTMLInputElement,
 *         backward: HTMLInputElement,
 *         forward: HTMLInputElement,
 *         decreaseVolume: HTMLInputElement,
 *         increaseVolume: HTMLInputElement,
 *         decreaseSpeed: HTMLInputElement,
 *         increaseSpeed: HTMLInputElement,
 *         resetSpeed: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 * }}
 */
const el = {
	enabled: byId("enabled"),
	saveAudio: byId("saveAudio"),
	playerEnabled: byId("playerEnabled"),
	shortcutsEnabled: byId("shortcutsEnabled"),
	skipSeconds: byId("skipSeconds"),
	save: byId("save"),
	shortcuts:{
		togglePlayer: byId("shortcutTogglePlayer"),
		togglePlay: byId("shortcutTogglePlay"),
		toggleMute: byId("shortcutToggleMute"),
		rewind: byId("shortcutRewind"),
		previous: byId("shortcutPrevious"),
		next: byId("shortcutNext"),
		backward: byId("shortcutBackward"),
		forward: byId("shortcutForward"),
		decreaseVolume: byId("shortcutDecreaseVolume"),
		increaseVolume: byId("shortcutIncreaseVolume"),
		decreaseSpeed: byId("shortcutDecreaseSpeed"),
		increaseSpeed: byId("shortcutIncreaseSpeed"),
		resetSpeed: byId("shortcutResetSpeed"),
		save: byId("saveShortcuts"),
	},
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		onlyNumber(el.skipSeconds, true);
		[
			el.shortcuts.togglePlayer,
			el.shortcuts.togglePlay,
			el.shortcuts.toggleMute,
			el.shortcuts.rewind,
			el.shortcuts.previous,
			el.shortcuts.next,
			el.shortcuts.backward,
			el.shortcuts.forward,
			el.shortcuts.decreaseVolume,
			el.shortcuts.increaseVolume,
			el.shortcuts.decreaseSpeed,
			el.shortcuts.increaseSpeed,
			el.shortcuts.resetSpeed,
		].forEach(e => onlyShorcut(e, true));
		await setFieldsValues(false);
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				text: {
					enabled: el.enabled.checked,
					save: el.saveAudio.checked,
					playerEnabled: el.playerEnabled.checked,
					shortcutsEnabled: el.shortcutsEnabled.checked,
					skipSeconds: numOr(el.skipSeconds.value, defaultOptions.audio.text.skipSeconds, 0, 300),
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("Audio Text settings saved");
	} catch (error) {
		console.error(error);
	}
});

el.shortcuts.save.addEventListener("click", async () => {
	try {
		const defaultShortcuts = defaultOptions.audio.text.shortcuts;
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				text: {
					shortcuts: {
						togglePlayer: strOr(el.shortcuts.togglePlayer.value, defaultShortcuts.togglePlayer),
						togglePlay: strOr(el.shortcuts.togglePlay.value, defaultShortcuts.togglePlay),
						toggleMute: strOr(el.shortcuts.toggleMute.value, defaultShortcuts.toggleMute),
						rewind: strOr(el.shortcuts.rewind.value, defaultShortcuts.rewind),
						previous: strOr(el.shortcuts.previous.value, defaultShortcuts.previous),
						next: strOr(el.shortcuts.next.value, defaultShortcuts.next),
						backward: strOr(el.shortcuts.backward.value, defaultShortcuts.backward),
						forward: strOr(el.shortcuts.forward.value, defaultShortcuts.forward),
						decreaseVolume: strOr(el.shortcuts.decreaseVolume.value, defaultShortcuts.decreaseVolume),
						increaseVolume: strOr(el.shortcuts.increaseVolume.value, defaultShortcuts.increaseVolume),
						decreaseSpeed: strOr(el.shortcuts.decreaseSpeed.value, defaultShortcuts.decreaseSpeed),
						increaseSpeed: strOr(el.shortcuts.increaseSpeed.value, defaultShortcuts.increaseSpeed),
						resetSpeed: strOr(el.shortcuts.resetSpeed.value, defaultShortcuts.resetSpeed),
					},
				},
			},
		};
		try {
			/**
			 * @type {BackgroundMessage}
			 */
			const message = {
				type: "playAudio",
				origin,
				playAudio: {
					playerEnabled: options.audio.playerEnabledToText,
					shortcutsEnabled: options.audio.shortcutsEnabledToText,
					shortcuts: options.audio.shortcuts,
				},
			};
			const tabs = await browser.tabs.query({});
			await Promise.allSettled(
				tabs.map(t => browser.tabs.sendMessage(t.id, message)),
			);
		} catch (error) {
			console.error(error);
		}
		await saveOptions(options);
		await setFieldsValues();
		showInfo("Audio Shortcuts to Text settings saved");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @param {boolean} shouldSendMessage
 * @returns {Promise<void>}
 */
async function setFieldsValues(shouldSendMessage=true) {
	/**
	 * @type {Options}
	 */
	const allOptions = await getAllOptions();
	const opt = allOptions.audio.text;
	el.enabled.checked = opt.enabled;
	el.saveAudio.checked = opt.save;
	el.playerEnabled.checked = opt.playerEnabled;
	el.shortcutsEnabled.checked = opt.shortcutsEnabled;
	el.skipSeconds.value = opt.skipSeconds.toString();
	el.shortcuts.togglePlayer.value = opt.shortcuts.togglePlayer;
	el.shortcuts.togglePlay.value = opt.shortcuts.togglePlay;
	el.shortcuts.toggleMute.value = opt.shortcuts.toggleMute;
	el.shortcuts.rewind.value = opt.shortcuts.rewind;
	el.shortcuts.previous.value = opt.shortcuts.previous;
	el.shortcuts.next.value = opt.shortcuts.next;
	el.shortcuts.backward.value = opt.shortcuts.backward;
	el.shortcuts.forward.value = opt.shortcuts.forward;
	el.shortcuts.decreaseVolume.value = opt.shortcuts.decreaseVolume;
	el.shortcuts.increaseVolume.value = opt.shortcuts.increaseVolume;
	el.shortcuts.decreaseSpeed.value = opt.shortcuts.decreaseSpeed;
	el.shortcuts.increaseSpeed.value = opt.shortcuts.increaseSpeed;
	el.shortcuts.resetSpeed.value = opt.shortcuts.resetSpeed;
	if (shouldSendMessage) {
		/**
		 * @type {BackgroundMessage}
		 */
		const message = {
			type: "playAudio",
			origin: "other",
			playAudio: {
				limitLoudness: allOptions.audio.limitLoudness,
				playerEnabled: opt.playerEnabled,
				shortcutsEnabled: opt.shortcutsEnabled,
				skipSeconds: opt.skipSeconds,
				shortcuts: opt.shortcuts,
			},
		};
		const tabs = await browser.tabs.query({});
		await Promise.allSettled(
			tabs.map(t => browser.tabs.sendMessage(t.id, message)),
		);
	}
}
