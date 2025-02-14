import "../utils/fflate.js";
import * as af from "../audio-fetcher/fetchers.js";
import defaultOptions from "../utils/default-options.js";
import { deepMerge }  from "../utils/object.js";
import { showPopup } from "../utils/show-popup.js";
import { splitWords } from "../utils/string.js";
import { threshold } from "../utils/number.js";
import {
	addonStorage,
	audioTable,
	controlTable,
	defaultIpaTable,
	errorsTable,
	ipaTable,
	optionsTable,
} from "../utils/storage-tables.js";
import {
	blob2base64,
	blob2object,
	byId,
	downloadObject,
	onlyNumber,
	onlyShorcut,
} from "../utils/element.js";

/**
 * @type {{
 *     general: {
 *         accessKey: HTMLInputElement,
 *         allowMultipleWords: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     ipa: {
 *         enabled: HTMLInputElement,
 *         fontFamily: HTMLInputElement,
 *         fontSize: HTMLInputElement,
 *         fontColor: HTMLInputElement,
 *         backgroundColor: HTMLInputElement,
 *         useContextColors: HTMLInputElement,
 *         positionMenuTriggered: HTMLSelectElement,
 *         positionActionTriggered: HTMLSelectElement,
 *         closeTimeout: HTMLInputElement,
 *         closeShortcut: HTMLInputElement,
 *         closeOnScroll: HTMLInputElement,
 *         antvasetEnabled: HTMLInputElement,
 *         antvasetOrder: HTMLInputElement,
 *         unalenguaEnabled: HTMLInputElement,
 *         unalenguaOrder: HTMLInputElement,
 *         oxfordEnabled: HTMLInputElement,
 *         oxfordOrder: HTMLInputElement,
 *         cambridgeEnabled: HTMLInputElement,
 *         cambridgeOrder: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     audio: {
 *         enabled: HTMLInputElement,
 *         volume: HTMLInputElement,
 *         playbackRate: HTMLInputElement,
 *         realVoiceEnabled: HTMLInputElement,
 *         realVoiceOrder: HTMLInputElement,
 *         realVoiceFetchTimeout: HTMLInputElement,
 *         googleSpeechEnabled: HTMLInputElement,
 *         googleSpeechOrder: HTMLInputElement,
 *         googleSpeechEnabledToText: HTMLInputElement,
 *         googleSpeechOrderToText: HTMLInputElement,
 *         googleSpeechSave: HTMLInputElement,
 *         responsiveVoiceEnabled: HTMLInputElement,
 *         responsiveVoiceOrder: HTMLInputElement,
 *         responsiveVoiceEnabledToText: HTMLInputElement,
 *         responsiveVoiceOrderToText: HTMLInputElement,
 *         responsiveVoiceApiName: HTMLInputElement,
 *         responsiveVoiceApiKey: HTMLInputElement,
 *         responsiveVoiceApiGender: HTMLSelectElement,
 *         save: HTMLButtonElement,
 *     },
 *     setPronuncationByShortcut: {
 *         enabled: HTMLInputElement,
 *         audioShortcut: HTMLInputElement,
 *         ipaShortcut: HTMLInputElement,
 *         restoreDefaultIpaShortcut: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     setCustomIpa: {
 *         word: HTMLInputElement,
 *         ipa: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     setCustomAudio: {
 *         word: HTMLInputElement,
 *         file: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     removeIpa: {
 *         word: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     removeAudio: {
 *         word: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     downloadStorage: {
 *         ipa: HTMLButtonElement,
 *         audio: HTMLButtonElement,
 *         options: HTMLButtonElement,
 *         errors: HTMLButtonElement,
 *         all: HTMLButtonElement,
 *     },
 *     updateIpaStorage: {
 *         file: HTMLInputElement,
 *         update: HTMLButtonElement,
 *     },
 *     updateAudioStorage: {
 *         file: HTMLInputElement,
 *         update: HTMLButtonElement,
 *     },
 *     updateOptionsStorage: {
 *         file: HTMLInputElement,
 *         update: HTMLButtonElement,
 *     },
 *     removeStorage: {
 *         ipa: HTMLButtonElement,
 *         audio: HTMLButtonElement,
 *         options: HTMLButtonElement,
 *         errors: HTMLButtonElement,
 *         all: HTMLButtonElement,
 *     },
 *     setCompleteIpa: HTMLButtonElement,
 *     restoreDefaultOptions: HTMLButtonElement,
 * }}
 */
const el = {
	general: {
		accessKey: byId("accessKey"),
		allowMultipleWords: byId("allowMultipleWords"),
		save: byId("saveGeneral"),
	},
	ipa: {
		enabled: byId("ipaEnabled"),
		fontFamily: byId("ipaFontFamily"),
		fontSize: byId("ipaFontSize"),
		fontColor: byId("ipaFontColor"),
		backgroundColor: byId("ipaBackgroundColor"),
		useContextColors: byId("ipaUseContextColors"),
		positionMenuTriggered: byId("ipaPositionMenuTriggered"),
		positionActionTriggered: byId("ipaPositionActionTriggered"),
		closeTimeout: byId("ipaCloseTimeout"),
		closeShortcut: byId("ipaCloseShortcut"),
		closeOnScroll: byId("ipaCloseOnScroll"),
		antvasetEnabled: byId("ipaAntvasetEnabled"),
		antvasetOrder: byId("ipaAntvasetOrder"),
		unalenguaEnabled: byId("ipaUnalenguaEnabled"),
		unalenguaOrder: byId("ipaUnalenguaOrder"),
		oxfordEnabled: byId("ipaOxfordEnabled"),
		oxfordOrder: byId("ipaOxfordOrder"),
		cambridgeEnabled: byId("ipaCambridgeEnabled"),
		cambridgeOrder: byId("ipaCambridgeOrder"),
		save: byId("saveIpa"),
	},
	audio: {
		enabled: byId("audioEnabled"),
		volume: byId("audioVolume"),
		playbackRate: byId("audioPlaybackRate"),
		realVoiceEnabled: byId("audioRealVoiceEnabled"),
		realVoiceOrder: byId("audioRealVoiceOrder"),
		realVoiceFetchTimeout: byId("audioRealVoiceFetchTimeout"),
		googleSpeechEnabled: byId("audioGoogleSpeechEnabled"),
		googleSpeechOrder: byId("audioGoogleSpeechOrder"),
		googleSpeechEnabledToText: byId("audioGoogleSpeechEnabledToText"),
		googleSpeechOrderToText: byId("audioGoogleSpeechOrderToText"),
		googleSpeechSave: byId("audioGoogleSpeechSave"),
		responsiveVoiceEnabled: byId("audioResponsiveVoiceEnabled"),
		responsiveVoiceOrder: byId("audioResponsiveVoiceOrder"),
		responsiveVoiceEnabledToText: byId("audioResponsiveVoiceEnabledToText"),
		responsiveVoiceOrderToText: byId("audioResponsiveVoiceOrderToText"),
		responsiveVoiceApiName: byId("audioResponsiveVoiceApiName"),
		responsiveVoiceApiKey: byId("audioResponsiveVoiceApiKey"),
		responsiveVoiceApiGender: byId("audioResponsiveVoiceApiGender"),
		save: byId("saveAudio"),
	},
	setPronuncationByShortcut: {
		enabled: byId("setPronuncationByShortcutEnabled"),
		audioShortcut: byId("setPronuncationByShortcutAudioShortcut"),
		ipaShortcut: byId("setPronuncationByShortcutIpaShortcut"),
		restoreDefaultIpaShortcut: byId("setPronuncationByShortcutRestoreDefaultIpaShortcut"),
		save: byId("saveSetPronunciationOnSites"),
	},
	setCustomIpa: {
		word: byId("setCustomIpaWord"),
		ipa: byId("setCustomIpa"),
		save: byId("saveCustomIpa"),
	},
	setCustomAudio: {
		word: byId("setCustomAudioWord"),
		file: byId("setCustomAudioFile"),
		save: byId("saveCustomAudio"),
	},
	removeIpa: {
		word: byId("removeIpaWord"),
		save: byId("saveRemoveIpa"),
	},
	removeAudio: {
		word: byId("removeAudioWord"),
		save: byId("saveRemoveAudio"),
	},
	downloadStorage: {
		ipa: byId("downloadIpaStorage"),
		audio: byId("downloadAudioStorage"),
		options: byId("downloadOptionsStorage"),
		errors: byId("downloadErrorsStorage"),
		all: byId("downloadAllStorage"),
	},
	updateIpaStorage: {
		file: byId("updateIpaStorageFile"),
		update: byId("updateIpaStorage"),
	},
	updateAudioStorage: {
		file: byId("updateAudioStorageFile"),
		update: byId("updateAudioStorage"),
	},
	updateOptionsStorage: {
		file: byId("updateOptionsStorageFile"),
		update: byId("updateOptionsStorage"),
	},
	removeStorage: {
		ipa: byId("removeIpaStorage"),
		audio: byId("removeAudioStorage"),
		errors: byId("removeErrorsStorage"),
	},
	setCompleteIpa: byId("setCompleteIpa"),
	restoreDefaultOptions: byId("restoreDefaultOptions"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		console.log("Options page entered");

		[
			el.ipa.fontSize,
			el.ipa.closeTimeout,
			el.audio.volume,
			el.audio.playbackRate,
			el.audio.realVoiceFetchTimeout,
		].forEach(e => onlyNumber(e, true));

		[
			el.ipa.unalenguaOrder,
			el.ipa.oxfordOrder,
			el.ipa.cambridgeOrder,
			el.audio.realVoiceOrder,
			el.audio.googleSpeechOrder,
			el.audio.realVoiceOrder,
		].forEach(e => onlyNumber(e, false));

		[
			el.general.accessKey,
			el.ipa.closeShortcut,
			el.setPronuncationByShortcut.audioShortcut,
			el.setPronuncationByShortcut.ipaShortcut,
		].forEach(onlyShorcut);

		await setFieldsValues();

	} catch (error) {
		console.error(error);
	}
});

el.general.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			accessKey: strOr(el.general.accessKey.value, defaultOptions.accessKey),
			allowMultipleWords: el.general.allowMultipleWords.checked,
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "General settings saved");
	} catch (error) {
		console.error(error);
	}
});

el.ipa.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			ipa: {
				enabled: el.ipa.enabled.checked,
				font: {
					family: strOr(el.ipa.fontFamily.value, defaultOptions.ipa.font.family),
					size: numOr(el.ipa.fontSize.value, defaultOptions.ipa.font.size, 2, 50),
					color: strOr(el.ipa.fontColor.value, defaultOptions.ipa.font.color),
					backgroundColor: strOr(el.ipa.backgroundColor.value, defaultOptions.ipa.font.backgroundColor),
				},
				useContextColors: el.ipa.useContextColors.checked,
				position: {
					menuTriggered: el.ipa.positionMenuTriggered.value,
					actionTriggered: el.ipa.positionActionTriggered.value,
				},
				close: {
					timeout: numOr(el.ipa.closeTimeout.value, defaultOptions.ipa.close.timeout, 500, 3600000),
					shortcut: strOr(el.ipa.closeShortcut.value, defaultOptions.ipa.close.shortcut),
					onScroll: el.ipa.closeOnScroll.checked,
				},
				antvaset: {
					enabled: el.ipa.antvasetEnabled.checked,
					order: numOr(el.ipa.antvasetOrder.value, defaultOptions.ipa.antvaset.order, 1, 20),
				},
				unalengua: {
					enabled: el.ipa.unalenguaEnabled.checked,
					order: numOr(el.ipa.unalenguaOrder.value, defaultOptions.ipa.unalengua.order, 1, 20),
				},
				oxford: {
					enabled: el.ipa.oxfordEnabled.checked,
					order: numOr(el.ipa.oxfordOrder.value, defaultOptions.ipa.oxford.order, 1, 20),
				},
				cambridge: {
					enabled: el.ipa.cambridgeEnabled.checked,
					order: numOr(el.ipa.cambridgeOrder.value, defaultOptions.ipa.cambridge.order, 1, 20),
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "IPA settings saved");
	} catch (error) {
		console.error(error);
	}
});

el.audio.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				enabled: el.audio.enabled.checked,
				volume: numOr(el.audio.volume.value, defaultOptions.audio.volume, 0, 1),
				playbackRate: numOr(el.audio.playbackRate.value, defaultOptions.audio.playbackRate, 0.2, 2),
				realVoice: {
					enabled: el.audio.realVoiceEnabled.checked,
					order: numOr(el.audio.realVoiceOrder.value, defaultOptions.audio.realVoice.order, 1, 20),
					fetchTimeout: numOr(el.audio.realVoiceFetchTimeout.value, defaultOptions.audio.realVoice.fetchTimeout, 0, 120000),
				},
				googleSpeech: {
					enabled: el.audio.googleSpeechEnabled.checked,
					order: numOr(el.audio.googleSpeechOrder.value, defaultOptions.audio.googleSpeech.order, 1, 20),
					enabledToText: el.audio.googleSpeechEnabledToText.checked,
					orderToText: numOr(el.audio.googleSpeechOrderToText.value, defaultOptions.audio.googleSpeech.orderToText, 1, 20),
					save: el.audio.googleSpeechSave.checked,
				},
				responsiveVoice: {
					enabled: el.audio.responsiveVoiceEnabled.checked,
					order: numOr(el.audio.responsiveVoiceOrder.value, defaultOptions.audio.responsiveVoice.order, 1, 20),
					enabledToText: el.audio.responsiveVoiceEnabledToText.checked,
					orderToText: numOr(el.audio.responsiveVoiceOrderToText.value, defaultOptions.audio.responsiveVoice.orderToText, 1, 20),
					api: {
						name: strOr(el.audio.responsiveVoiceApiName.value, defaultOptions.audio.responsiveVoice.api.name),
						key: strOr(el.audio.responsiveVoiceApiKey.value, defaultOptions.audio.responsiveVoice.api.key),
						gender: strOr(el.audio.responsiveVoiceApiGender.value, defaultOptions.audio.responsiveVoice.api.gender),
					},
				},
			},
		};
		try {
			const leKey = "audioLastError";
			/**
			 * @type{{ [key: string]: PronunciationFetcherLastError}
			 */
			const le = await controlTable.getValue(leKey);
			/**
			 * @type {Options}
			 */
			const currOpt = await optionsTable.getAll();
			let updateLastError = false;
			if (
				options.audio.responsiveVoice.api.key !==
				currOpt.audio.responsiveVoice.api.key &&
				af.AFResponsiveVoice.name in le
			) {
				updateLastError = true;
				delete le[af.AFResponsiveVoice.name];
			}
			if (updateLastError) {
				await controlTable.set(leKey, le);
			}
		} catch (error) {
			console.error(error);
		}
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "Audio settings saved");
	} catch (error) {
		console.error(error);
	}
});

el.setPronuncationByShortcut.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			setPronuncationByShortcut: {
				enabled: el.setPronuncationByShortcut.enabled.checked,
				audioShortcut: strOr(el.setPronuncationByShortcut.audioShortcut.value, defaultOptions.setPronuncationByShortcut.audioShortcut),
				ipaShortcut: strOr(el.setPronuncationByShortcut.ipaShortcut.value, defaultOptions.setPronuncationByShortcut.ipaShortcut),
				restoreDefaultIpaShortcut: strOr(el.setPronuncationByShortcut.restoreDefaultIpaShortcut.value, defaultOptions.setPronuncationByShortcut.restoreDefaultIpaShortcut),
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "Set pronunciation by shortcut settings saved");
	} catch (error) {
		console.error(error);
	}
});

el.setCustomIpa.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		const rawWord = el.setCustomIpa.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			showInfo(currentTarget, "No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			showInfo(currentTarget, `Word max length is 45, but this has ${word.length}`);
			return;
		}
		const ipa = el.setCustomIpa.ipa.value.trim();
		if (ipa.length === 0) {
			showInfo(currentTarget, "No IPA was found in input");
			return;
		}
		if (ipa.length > 60) {
			showInfo(currentTarget, `IPA max length is 60, but this has ${ipa.length}`);
			return;
		}
		await ipaTable.set(word, ipa);
		await setFieldsValues();
		showInfo(currentTarget, `${word} = ${ipa}`);
	} catch (error) {
		console.error(error);
	}
});

el.setCustomAudio.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		const rawWord = el.setCustomAudio.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			showInfo(currentTarget, "No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			showInfo(currentTarget, `Word max length is 45, but this has ${word.length}`);
			return;
		}
		const file = el.setCustomAudio.file.files?.[0];
		if (!file) {
			showInfo(currentTarget, "No file was found in input");
			return;
		}
		const kb = file.size / 1000;
		if (kb > 60) {
			showInfo(currentTarget, `File max size is 60KB, but this has ${kb}KB`);
			return;
		}
		try {
			const base64 = await blob2base64(file);
			const audio = new Audio(base64);
			audio.volume = 0;
			await audio.play();
			await audioTable.set(word, base64);
			await setFieldsValues();
			showInfo(currentTarget, `${word} audio saved`);
		} catch (error) {
			showInfo(currentTarget, `Error with the file: ${error}`);
			console.error(error);
		}
	} catch (error) {
		console.error(error);
	}
});

el.removeIpa.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		const rawWord = el.removeIpa.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			showInfo(currentTarget, "No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			showInfo(currentTarget, `Word max length is 45, but this has ${word.length}`);
			return;
		}
		await ipaTable.remove(word);
		await setFieldsValues();
		showInfo(currentTarget, `${word} IPA removed`);
	} catch (error) {
		console.error(error);
	}
});

el.removeAudio.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		const rawWord = el.removeAudio.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			showInfo(currentTarget, "No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			showInfo(currentTarget, `Word max length is 45, but this has ${word.length}`);
			return;
		}
		await audioTable.remove(word);
		await setFieldsValues();
		showInfo(currentTarget, `${word} audio removed`);
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.ipa.addEventListener("click", async () => {
	try {
		const ipaStorage = await ipaTable.getAll();
		await downloadObject(ipaStorage, fileName("pronunciation-ipa-storage.json"));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.audio.addEventListener("click", async () => {
	try {
		const audioStorage = await audioTable.getAll();
		await downloadObject(audioStorage, fileName("pronunciation-audio-storage.json"));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.options.addEventListener("click", async () => {
	try {
		const optionsStorage = await optionsTable.getAll();
		await downloadObject(optionsStorage, fileName("pronunciation-options-storage.json"));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.errors.addEventListener("click", async () => {
	try {
		const errorsStorage = await errorsTable.getAll();
		await downloadObject(errorsStorage, fileName("pronunciation-errors-storage.json"));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.all.addEventListener("click", async () => {
	try {
		const storage = await addonStorage.get();
		await downloadObject(storage, fileName("pronunciation-all-storage.json"));
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.updateIpaStorage.update.addEventListener("click", async ({ currentTarget }) => {
	try {
		const file = el.updateIpaStorage.file.files?.[0];
		if (!file) {
			showInfo(currentTarget, "No file was found in input");
			return;
		}
		const values = await blob2object(file);
		await ipaTable.setMany(values);
		await setFieldsValues();
		showInfo(currentTarget, "IPA storage updated");
	} catch (error) {
		console.error(error);
	}
});

el.updateAudioStorage.update.addEventListener("click", async ({ currentTarget }) => {
	try {
		const file = el.updateAudioStorage.file.files?.[0];
		if (!file) {
			showInfo(currentTarget, "No file was found in input");
			return;
		}
		const values = await blob2object(file);
		await audioTable.setMany(values);
		await setFieldsValues();
		showInfo(currentTarget, "Audio storage updated");
	} catch (error) {
		console.error(error);
	}
});

el.updateOptionsStorage.update.addEventListener("click", async ({ currentTarget }) => {
	try {
		const file = el.updateOptionsStorage.file.files?.[0];
		if (!file) {
			showInfo(currentTarget, "No file was found in input");
			return;
		}
		/**
		 * @type {Options}
		 */
		const options = await blob2object(file);
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "Options storage updated");
	} catch (error) {
		console.error(error);
	}
});

el.removeStorage.ipa.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to remove IPA storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await ipaTable.clear();
		await setFieldsValues();
		showInfo(currentTarget, "IPA storage removed");
	} catch (error) {
		console.error(error);
	}
});

el.removeStorage.audio.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to remove audio storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await audioTable.clear();
		await setFieldsValues();
		showInfo(currentTarget, "Audio storage removed");
	} catch (error) {
		console.error(error);
	}
});

el.removeStorage.errors.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to remove errors storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await errorsTable.clear();
		await setFieldsValues();
		showInfo(currentTarget, "Errors storage removed");
	} catch (error) {
		console.error(error);
	}
});

el.setCompleteIpa.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to set complete pre-defined IPA definitions (some definitions may be overrode and may take some time)?";
		if (!window.confirm(msg)) {
			return;
		}
		console.log("Getting gzip URL");
		const url = browser.runtime.getURL("resources/complete-ipa.json.gz");
		console.log("Fetching gzip file");
		const response = await fetch(url);
		console.log("Creating gzip buffer");
		const gzipBuffer = new Uint8Array(await response.arrayBuffer());
		console.log("Decompressing gzip buffer");
		const ipaBuffer = fflate.decompressSync(gzipBuffer);
		console.log("Decoding decompressed gzip");
		const ipaDecoded = new TextDecoder().decode(ipaBuffer);
		console.log("Parsing decoded gzip");
		const values = JSON.parse(ipaDecoded);
		console.log("Storing parsed gzip");
		await Promise.all([
			ipaTable.setMany(values),
			defaultIpaTable.setMany(values),
		]);
		showInfo(currentTarget, "Complete pre-defined IPA definitions set");
	} catch (error) {
		console.error(error);
	}
});

el.restoreDefaultOptions.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to restore the options to default?";
		if (!window.confirm(msg)) {
			return;
		}
		await optionsTable.setMany(defaultOptions);
		await setFieldsValues();
		showInfo(currentTarget, "Default options restored");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	/**
	 * @type {Options}
	 */
	const opt = await optionsTable.getAll();
	el.general.accessKey.value = opt.accessKey;
	el.general.allowMultipleWords.checked = opt.allowMultipleWords;
	el.ipa.enabled.checked = opt.ipa.enabled;
	el.ipa.fontFamily.value = opt.ipa.font.family;
	el.ipa.fontSize.value = opt.ipa.font.size.toString();
	el.ipa.fontColor.value = opt.ipa.font.color;
	el.ipa.backgroundColor.value = opt.ipa.font.backgroundColor;
	el.ipa.useContextColors.checked = opt.ipa.useContextColors;
	el.ipa.positionMenuTriggered.value = opt.ipa.position.menuTriggered;
	el.ipa.positionActionTriggered.value = opt.ipa.position.actionTriggered;
	el.ipa.closeTimeout.value = opt.ipa.close.timeout.toString();
	el.ipa.closeShortcut.value = opt.ipa.close.shortcut;
	el.ipa.closeOnScroll.checked = opt.ipa.close.onScroll;
	el.ipa.antvasetEnabled.checked = opt.ipa.antvaset.enabled;
	el.ipa.antvasetOrder.value = opt.ipa.antvaset.order.toString();
	el.ipa.unalenguaEnabled.checked = opt.ipa.unalengua.enabled;
	el.ipa.unalenguaOrder.value = opt.ipa.unalengua.order.toString();
	el.ipa.cambridgeEnabled.checked = opt.ipa.cambridge.enabled;
	el.ipa.cambridgeOrder.value = opt.ipa.cambridge.order.toString();
	el.ipa.oxfordEnabled.checked = opt.ipa.oxford.enabled;
	el.ipa.oxfordOrder.value = opt.ipa.oxford.order.toString();
	el.audio.enabled.checked = opt.audio.enabled;
	el.audio.volume.value = opt.audio.volume.toString();
	el.audio.playbackRate.value = opt.audio.playbackRate.toString();
	el.audio.realVoiceEnabled.checked = opt.audio.realVoice.enabled;
	el.audio.realVoiceOrder.value = opt.audio.realVoice.order.toString();
	el.audio.realVoiceFetchTimeout.value = opt.audio.realVoice.fetchTimeout.toString();
	el.audio.googleSpeechEnabled.checked = opt.audio.googleSpeech.enabled;
	el.audio.googleSpeechOrder.value = opt.audio.googleSpeech.order.toString();
	el.audio.googleSpeechEnabledToText.checked = opt.audio.googleSpeech.enabledToText;
	el.audio.googleSpeechOrderToText.value = opt.audio.googleSpeech.orderToText.toString();
	el.audio.googleSpeechSave.checked = opt.audio.googleSpeech.save;
	el.audio.responsiveVoiceEnabledToText.checked = opt.audio.responsiveVoice.enabledToText;
	el.audio.responsiveVoiceOrderToText.value = opt.audio.responsiveVoice.orderToText.toString();
	el.audio.responsiveVoiceEnabled.checked = opt.audio.responsiveVoice.enabled;
	el.audio.responsiveVoiceOrder.value = opt.audio.responsiveVoice.order.toString();
	el.audio.responsiveVoiceApiName.value = opt.audio.responsiveVoice.api.name;
	el.audio.responsiveVoiceApiKey.value = opt.audio.responsiveVoice.api.key;
	el.audio.responsiveVoiceApiGender.value = opt.audio.responsiveVoice.api.gender;
	el.setPronuncationByShortcut.enabled.checked = opt.setPronuncationByShortcut.enabled;
	el.setPronuncationByShortcut.ipaShortcut.value = opt.setPronuncationByShortcut.ipaShortcut;
	el.setPronuncationByShortcut.audioShortcut.value = opt.setPronuncationByShortcut.audioShortcut;
	el.setPronuncationByShortcut.restoreDefaultIpaShortcut.value = opt.setPronuncationByShortcut.restoreDefaultIpaShortcut;
	el.setCustomIpa.word.value = "";
	el.setCustomIpa.ipa.value = "";
	el.setCustomAudio.word.value = "";
	el.setCustomAudio.file.value = "";
	el.removeIpa.word.value = "";
	el.removeAudio.word.value = "";
	el.updateIpaStorage.file.value = "";
	el.updateAudioStorage.file.value = "";
	el.updateOptionsStorage.file.value = "";
}

/**
 * @param {Options} options
 * @param {?Options} currentOptions
 * @returns {Promise<void>}
 */
async function saveOptions(options, currentOptions) {
	let currOpt = currentOptions;
	if (!currOpt) {
		/**
		 * @type {Options}
		 */
		const tblOpt = await optionsTable.getAll();
		currOpt = tblOpt;
	}
	return optionsTable.setMany(deepMerge(currOpt, options, true));
}

/**
 * @param {string} value
 * @param {string} defaultValue
 * @returns {string}
 */
function strOr(value, defaultValue) {
	return value.trim() || defaultValue;
}

/**
 * @param {string} value
 * @param {number} defaultValue
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function numOr(value, defaultValue, min=0, max=Number.MAX_VALUE) {
	const trimmed = value.trim();
	const num = trimmed.length > 0 ? parseFloat(trimmed) : defaultValue;
	return threshold(min, max, num);
}

/**
 * @param {HTMLElement} element
 * @param {string} info
 * @param {closeTimeout} number
 * @returns {void}
 */
function showInfo(element, info, closeTimeout=5000) {
	const { top, left } = element.getBoundingClientRect();
	showPopup({
		text: info,
		position: {
			top: top + element.offsetHeight * -1,
			left,
		},
		close: {
			timeout: closeTimeout,
		},
	});
}

/**
 * @param {string} suffix
 * @returns {string}
 */
function fileName(suffix) {
	const prefix = new Date()
		.toISOString()
		.replaceAll(":", "-")
		.replaceAll(".", "-");
	return `${prefix}-${suffix}`;
}
