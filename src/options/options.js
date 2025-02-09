import defaultOptions from "../utils/default-options.js";
import { splitWords } from "../utils/string.js";
import { threshold } from "../utils/number.js";
import {
	addonStorage,
	audioTable,
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
 *         save: HTMLButtonElement,
 *     },
 *     audio: {
 *         enabled: HTMLInputElement,
 *         volume: HTMLInputElement,
 *         playbackRate: HTMLInputElement,
 *         fetchFileTimeout: HTMLInputElement,
 *         responseVoiceName: HTMLInputElement,
 *         responseVoiceKey: HTMLInputElement,
 *         responseVoiceGender: HTMLSelectElement,
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
		save: byId("saveIpa"),
	},
	audio: {
		enabled: byId("audioEnabled"),
		volume: byId("audioVolume"),
		playbackRate: byId("audioPlaybackRate"),
		fetchFileTimeout: byId("audioFetchFileTimeout"),
		responseVoiceName: byId("audioResponseVoiceName"),
		responseVoiceKey: byId("audioResponseVoiceKey"),
		responseVoiceGender: byId("audioResponseVoiceGender"),
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
	restoreDefaultOptions: byId("restoreDefaultOptions"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		console.log("options page entered");

		[
			el.ipa.fontSize,
			el.ipa.closeTimeout,
			el.audio.volume,
			el.audio.playbackRate,
			el.audio.fetchFileTimeout,
		].forEach(onlyNumber);

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

el.general.save.addEventListener("click", async () => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			accessKey: strOr(el.general.accessKey.value, defaultOptions.accessKey),
			allowMultipleWords: el.general.allowMultipleWords.checked,
		};
		await optionsTable.setMany(options);
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.ipa.save.addEventListener("click", async () => {
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
			},
		};
		await optionsTable.setMany(options);
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.audio.save.addEventListener("click", async () => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			audio: {
				enabled: el.audio.enabled.checked,
				volume: numOr(el.audio.volume.value, defaultOptions.audio.volume, 0, 1),
				playbackRate: numOr(el.audio.playbackRate.value, defaultOptions.audio.playbackRate, 0.2, 2),
				fetchFileTimeout: numOr(el.audio.fetchFileTimeout.value, defaultOptions.audio.fetchFileTimeout, 0, 120000),
				responseVoice: {
					name: strOr(el.audio.responseVoiceName.value, defaultOptions.audio.responseVoice.name),
					key: strOr(el.audio.responseVoiceKey.value, defaultOptions.audio.responseVoice.key),
					gender: strOr(el.audio.responseVoiceGender.value, defaultOptions.audio.responseVoice.gender),
				},
			},
		};
		await optionsTable.setMany(options);
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.setPronuncationByShortcut.save.addEventListener("click", async () => {
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
		await optionsTable.setMany(options);
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.setCustomIpa.save.addEventListener("click", async () => {
	try {
		const rawWord = el.setCustomIpa.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			window.alert("No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			window.alert(`Word max length is 45, but this has ${word.length}`);
			return;
		}
		const ipa = el.setCustomIpa.ipa.value.trim();
		if (ipa.length === 0) {
			window.alert("No IPA was found in input");
			return;
		}
		if (ipa.length > 60) {
			window.alert(`IPA max length is 60, but this has ${ipa.length}`);
			return;
		}
		await ipaTable.set(word, ipa);
		await setFieldsValues();
		window.alert(`${word} = ${ipa}`);
	} catch (error) {
		console.error(error);
	}
});

el.setCustomAudio.save.addEventListener("click", async () => {
	try {
		const rawWord = el.setCustomAudio.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			window.alert("No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			window.alert(`Word max length is 45, but this has ${word.length}`);
			return;
		}
		const file = el.setCustomAudio.file.files?.[0];
		if (!file) {
			window.alert("No file was found in input");
			return;
		}
		const kb = file.size / 1000;
		if (kb > 60) {
			window.alert(`File max size is 60KB, but this has ${kb}KB`);
			return;
		}
		try {
			const base64 = await blob2base64(file);
			const audio = new Audio(base64);
			audio.volume = 0;
			await audio.play();
			await audioTable.set(word, base64);
			await setFieldsValues();
			window.alert(`${word} audio saved`);
		} catch (error) {
			window.alert(`Error with the file: ${error}`);
			console.error(error);
		}
	} catch (error) {
		console.error(error);
	}
});

el.removeIpa.save.addEventListener("click", async () => {
	try {
		const rawWord = el.removeIpa.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			window.alert("No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			window.alert(`Word max length is 45, but this has ${word.length}`);
			return;
		}
		await ipaTable.remove(word);
		await setFieldsValues();
		window.alert(`${word} IPA removed`);
	} catch (error) {
		console.error(error);
	}
});

el.removeAudio.save.addEventListener("click", async () => {
	try {
		const rawWord = el.removeAudio.word.value.trim().toLowerCase();
		const words = splitWords(rawWord);
		if (words.length === 0) {
			window.alert("No word was found in input");
			return;
		}
		const word = words[0];
		if (word.length > 45) {
			window.alert(`Word max length is 45, but this has ${word.length}`);
			return;
		}
		await audioTable.remove(word);
		await setFieldsValues();
		window.alert(`${word} audio removed`);
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.ipa.addEventListener("click", async () => {
	try {
		const ipaStorage = await ipaTable.getAll();
		await downloadObject(ipaStorage, "pronunciation-ipa-storage.json");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.audio.addEventListener("click", async () => {
	try {
		const audioStorage = await audioTable.getAll();
		await downloadObject(audioStorage, "pronunciation-audio-storage.json");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.options.addEventListener("click", async () => {
	try {
		const optionsStorage = await optionsTable.getAll();
		console.log({ optionsStorage });
		await downloadObject(optionsStorage, "pronunciation-options-storage.json");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.errors.addEventListener("click", async () => {
	try {
		const errorsStorage = await errorsTable.getAll();
		await downloadObject(errorsStorage, "pronunciation-errors-storage.json");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.downloadStorage.all.addEventListener("click", async () => {
	try {
		const storage = await addonStorage.get();
		await downloadObject(storage, "pronunciation-all-storage.json");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.updateIpaStorage.update.addEventListener("click", async () => {
	try {
		const file = el.updateIpaStorage.file.files?.[0];
		if (!file) {
			window.alert("No file was found in input");
			return;
		}
		const values = await blob2object(file);
		await ipaTable.setMany(values);
		await setFieldsValues();
		window.alert("IPA storage updated");
	} catch (error) {
		console.error(error);
	}
});

el.updateAudioStorage.update.addEventListener("click", async () => {
	try {
		const file = el.updateAudioStorage.file.files?.[0];
		if (!file) {
			window.alert("No file was found in input");
			return;
		}
		const values = await blob2object(file);
		await audioTable.setMany(values);
		await setFieldsValues();
		window.alert("Audio storage updated");
	} catch (error) {
		console.error(error);
	}
});

el.updateOptionsStorage.update.addEventListener("click", async () => {
	try {
		const file = el.updateOptionsStorage.file.files?.[0];
		if (!file) {
			window.alert("No file was found in input");
			return;
		}
		const values = await blob2object(file);
		await optionsTable.setMany(values);
		await setFieldsValues();
		window.alert("Options storage updated");
	} catch (error) {
		console.error(error);
	}
});

el.restoreDefaultOptions.addEventListener("click", async () => {
	try {
		await optionsTable.setMany(defaultOptions);
		await setFieldsValues();
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
	el.audio.enabled.checked = opt.audio.enabled;
	el.audio.volume.value = opt.audio.volume.toString();
	el.audio.playbackRate.value = opt.audio.playbackRate.toString();
	el.audio.fetchFileTimeout.value = opt.audio.fetchFileTimeout.toString();
	el.audio.responseVoiceName.value = opt.audio.responseVoice.name;
	el.audio.responseVoiceKey.value = opt.audio.responseVoice.key;
	el.audio.responseVoiceGender.value = opt.audio.responseVoice.gender;
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
