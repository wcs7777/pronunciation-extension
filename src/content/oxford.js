import { blob2base64, url2blob } from "../utils/element";
import { showPopup } from "../utils/show-popup";
import { splitWords } from "../utils/string.js";
import {
    audioTable,
	defaultIpaTable,
	ipaTable,
	optionsTable,
} from "../utils/storage-tables.js";

/**
 * @returns {Promise<void>}
 */
async function main() {
	/**
	 * @type {OptionsSetPronuncationByShortcut}
	 */
	const options = await optionsTable.getValue("setPronuncationByShortcut");
	if (!options.enabled) {
		return;
	}
	console.log("Pronunciation shortcut enabled", { options });
	const audioElements = Array.from(
		document.querySelectorAll("div.sound.audio_play_button"),
	);
	/**
	 * @type {HTMLElement}
	 */
	let lastAudioPlayed = document.querySelector(
		"div.sound.audio_play_button.pron-us",
	)
	for (const element of audioElements) {
		element.addEventListener("click", () => {
			lastAudioPlayed = element;
		});
	}
	document.addEventListener("keydown", async (e) => {
		try {
			if (!e.ctrlKey) {
				return;
			}
			const key = e.key.toUpperCase();
			const shortcuts = [
				options.ipaShortcut,
				options.audioShortcut,
				options.restoreDefaultIpaShortcut,
			];
			if (!shortcuts.includes(key)) {
				return;
			}
			e.preventDefault();
			const cb = {
				[options.ipaShortcut]: async () => {
					const word = getWord(lastAudioPlayed);
					console.log("Pronunciation shortcut", { word });
					const ipa = lastAudioPlayed
						.nextElementSibling
						.textContent;
					console.log("Pronunciation shortcut", { ipa });
					const oldIpa = await ipaTable.getValue(word, false);
					await ipaTable.set(word, ipa);
					showPopup({ text: `${oldIpa} -> ${ipa}` });
				},
				[options.audioShortcut]: async () => {
					const word = getWord(lastAudioPlayed);
					console.log("Pronunciation shortcut", { word });
					const src = lastAudioPlayed.dataset?.srcOgg;
					if (!src) {
						showPopup({ text: `Audio not found for ${word}` });
						return;
					}
					const url = (
						src.startsWith("https://") ?
						src :
						`${window.location.origin}${src}`
					);
					console.log("Pronunciation shortcut", { url });
					const blob = await url2blob(url);
					const base64 = await blob2base64(blob);
					await audioTable.set(word, base64);
					showPopup({ text: `Audio saved for ${word}`});
				},
				[options.restoreDefaultIpaShortcut]: async () => {
					const word = getWord(lastAudioPlayed);
					console.log("Pronunciation shortcut", { word });
					const currentIpa = await ipaTable.getValue(
						word, false,
					);
					const defaultIpa = await defaultIpaTable.getValue(
						word, false,
					);
					if (defaultIpa) {
						await ipaTable.set(word, defaultIpa);
						showPopup({
							text: `${currentIpa} -> ${defaultIpa}`,
						});
					} else {
						showPopup({
							text: `There is no default IPA of ${word}`,
						});
					}
				},
			};
			await cb[key]();
		} catch (error) {
			console.error(error);
		}
	});
}

/**
 * @param {HTMLElement} lastAudioPlayed
 * @returns {string}
 */
function getWord(lastAudioPlayed) {
	const words = splitWords(lastAudioPlayed.title.trim().toLowerCase());
	return words[0].toLowerCase();
}

(async () => main())().catch(console.error);
