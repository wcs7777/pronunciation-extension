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
			const rawWord = document
				.querySelector("span.hw.dhw")
				.textContent
				.trim()
				.toLowerCase();
			const word = splitWords(rawWord)[0].toLowerCase();
			console.log("Pronunciation shortcut", { word });
			const cb = {
				[options.ipaShortcut]: async () => {
					const rawIpa = document.querySelector("span.ipa")
						.textContent
						.trim();
					const ipa = `/${rawIpa}/`;
					console.log("Pronunciation shortcut", { ipa });
					const oldIpa = await ipaTable.getValue(word, false);
					await ipaTable.set(word, ipa);
					showPopup({ text: `${oldIpa} -> ${ipa}` });
				},
				[options.audioShortcut]: async () => {
					const src = document
						.querySelector("span.us audio source")
						?.getAttribute("src");
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

(async () => main())().catch(console.error);
