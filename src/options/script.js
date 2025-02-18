import "../utils/fflate.js";
import "../utils/Sortable.min.js";
import * as af from "../audio-fetcher/fetchers.js";
import defaultOptions from "../utils/default-options.js";
import { deepMerge }  from "../utils/object.js";
import { showPopup } from "../utils/show-popup.js";
import { kebab2camel, splitWords } from "../utils/string.js";
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
 *         allowText: HTMLInputElement,
 *         save: HTMLButtonElement,
 *     },
 *     ipa: {
 *         enabled: HTMLInputElement,
 *         enabledToText: HTMLInputElement,
 *         font: {
 *             family: HTMLInputElement,
 *             size: HTMLInputElement,
 *             color: HTMLInputElement,
 *             backgroundColor: HTMLInputElement,
 *         },
 *         useContextColors: HTMLInputElement,
 *         position: {
 *             menuTriggered: HTMLSelectElement,
 *             actionTriggered: HTMLSelectElement,
 *         },
 *         close: {
 *             timeout: HTMLInputElement,
 *             shortcut: HTMLInputElement,
 *             onScroll: HTMLInputElement,
 *         },
 *         order: {
 *             antvaset: HTMLElement,
 *             antvasetEnabled: HTMLInputElement,
 *             unalengua: HTMLElement,
 *             unalenguaEnabled: HTMLInputElement,
 *             oxford: HTMLElement,
 *             oxfordEnabled: HTMLInputElement,
 *             cambridge: HTMLElement,
 *             cambridgeEnabled: HTMLInputElement,
 *         },
 *         orderToText: {
 *             unalengua: HTMLElement,
 *             unalenguaEnabled: HTMLInputElement,
 *         },
 *         save: HTMLButtonElement,
 *     },
 *     audio: {
 *         enabled: HTMLInputElement,
 *         enabledToText: HTMLInputElement,
 *         volume: HTMLInputElement,
 *         playbackRate: HTMLInputElement,
 *         order: {
 *             realVoice: HTMLElement,
 *             realVoiceEnabled: HTMLInputElement,
 *             googleSpeech: HTMLElement,
 *             googleSpeechEnabled: HTMLInputElement,
 *             responsiveVoice: HTMLElement,
 *             responsiveVoiceEnabled: HTMLInputElement,
 *             unrealSpeech: HTMLElement,
 *             unrealSpeechEnabled: HTMLInputElement,
 *             speechify: HTMLElement,
 *             speechifyEnabled: HTMLInputElement,
 *             playHt: HTMLElement,
 *             playHtEnabled: HTMLInputElement,
 *         },
 *         orderToText: {
 *             googleSpeech: HTMLElement,
 *             googleSpeechEnabled: HTMLInputElement,
 *             responsiveVoice: HTMLElement,
 *             responsiveVoiceEnabled: HTMLInputElement,
 *             unrealSpeech: HTMLElement,
 *             unrealSpeechEnabled: HTMLInputElement,
 *             speechify: HTMLElement,
 *             speechifyEnabled: HTMLInputElement,
 *             playHt: HTMLElement,
 *             playHtEnabled: HTMLInputElement,
 *         },
 *         realVoice: {
 *             fetchTimeout: HTMLInputElement,
 *         },
 *         googleSpeech: {
 *             save: HTMLInputElement,
 *         },
 *         responsiveVoice: {
 *             api: {
 *                 key: HTMLInputElement,
 *                 gender: HTMLSelectElement,
 *             },
 *         },
 *         unrealSpeech: {
 *             api: {
 *                 token: HTMLInputElement,
 *                 voiceId: HTMLSelectElement,
 *                 bitRate: HTMLSelectElement,
 *                 pitch: HTMLInputElement,
 *                 codec: HTMLSelectElement,
 *                 temperature: HTMLInputElement,
 *             },
 *         },
 *         speechify: {
 *             api: {
 *                 token: HTMLInputElement,
 *                 voiceId: HTMLSelectElement,
 *                 voiceIdNotListed: HTMLSelectElement,
 *             },
 *         },
 *         playHt: {
 *             api: {
 *                 userId: HTMLInputElement,
 *                 key: HTMLInputElement,
 *                 voiceId: HTMLSelectElement,
 *                 voiceIdNotListed: HTMLInputElement,
 *                 quality: HTMLSelectElement,
 *                 outputFormat: HTMLSelectElement,
 *                 sampleRate: HTMLInputElement,
 *                 temperature: HTMLInputElement,
 *                 voiceEngine: HTMLSelectElement,
 *             },
 *         },
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
		allowText: byId("allowText"),
		save: byId("saveGeneral"),
	},
	ipa: {
		enabled: byId("ipaEnabled"),
		enabledToText: byId("ipaEnabledToText"),
		font: {
			family: byId("ipaFontFamily"),
			size: byId("ipaFontSize"),
			color: byId("ipaFontColor"),
			backgroundColor: byId("ipaBackgroundColor"),
		},
		useContextColors: byId("ipaUseContextColors"),
		position: {
			menuTriggered: byId("ipaPositionMenuTriggered"),
			actionTriggered: byId("ipaPositionActionTriggered"),
		},
		close: {
			timeout: byId("ipaCloseTimeout"),
			shortcut: byId("ipaCloseShortcut"),
			onScroll: byId("ipaCloseOnScroll"),
		},
		order: {
			antvaset: byId("ipaAntvasetOrder"),
			antvasetEnabled: byId("ipaAntvasetEnabled"),
			unalengua: byId("ipaUnalenguaOrder"),
			unalenguaEnabled: byId("ipaUnalenguaEnabled"),
			oxford: byId("ipaOxfordOrder"),
			oxfordEnabled: byId("ipaOxfordEnabled"),
			cambridge: byId("ipaCambridgeOrder"),
			cambridgeEnabled: byId("ipaCambridgeEnabled"),
		},
		orderToText: {
			unalengua: byId("ipaUnalenguaOrderToText"),
			unalenguaEnabled: byId("ipaUnalenguaEnabledToText"),
		},
		save: byId("saveIpa"),
	},
	audio: {
		enabled: byId("audioEnabled"),
		enabledToText: byId("audioEnabledToText"),
		volume: byId("audioVolume"),
		playbackRate: byId("audioPlaybackRate"),
		order: {
			realVoice: byId("audioRealVoiceOrder"),
			realVoiceEnabled: byId("audioRealVoiceEnabled"),
			googleSpeech: byId("audioGoogleSpeechOrder"),
			googleSpeechEnabled: byId("audioGoogleSpeechEnabled"),
			responsiveVoice: byId("audioResponsiveVoiceOrder"),
			responsiveVoiceEnabled: byId("audioResponsiveVoiceEnabled"),
			unrealSpeech: byId("audioUnrealSpeechOrder"),
			unrealSpeechEnabled: byId("audioUnrealSpeechEnabled"),
			speechify: byId("audioSpeechifyOrder"),
			speechifyEnabled: byId("audioSpeechifyEnabled"),
			playHt: byId("audioPlayHtOrder"),
			playHtEnabled: byId("audioPlayHtEnabled"),
		},
		orderToText: {
			googleSpeech: byId("audioGoogleSpeechOrderToText"),
			googleSpeechEnabled: byId("audioGoogleSpeechEnabledToText"),
			responsiveVoice: byId("audioResponsiveVoiceOrderToText"),
			responsiveVoiceEnabled: byId("audioResponsiveVoiceEnabledToText"),
			unrealSpeech: byId("audioUnrealSpeechOrderToText"),
			unrealSpeechEnabled: byId("audioUnrealSpeechEnabledToText"),
			speechify: byId("audioSpeechifyOrderToText"),
			speechifyEnabled: byId("audioSpeechifyEnabledToText"),
			playHt: byId("audioPlayHtOrderToText"),
			playHtEnabled: byId("audioPlayHtEnabledToText"),
		},
		realVoice: {
			fetchTimeout: byId("audioRealVoiceFetchTimeout"),
		},
		googleSpeech: {
			save: byId("audioGoogleSpeechSave"),
		},
		responsiveVoice: {
			api: {
				key: byId("audioResponsiveVoiceApiKey"),
				gender: byId("audioResponsiveVoiceApiGender"),
			},
		},
		unrealSpeech: {
			api: {
				token: byId("audioUnrealSpeechApiToken"),
				voiceId: byId("audioUnrealSpeechApiVoiceId"),
				bitRate: byId("audioUnrealSpeechApiBitRate"),
				pitch: byId("audioUnrealSpeechApiPitch"),
				codec: byId("audioUnrealSpeechApiCodec"),
				temperature: byId("audioUnrealSpeechApiTemperature"),
			},
		},
		speechify: {
			api: {
				token: byId("audioSpeechifyApiToken"),
				voiceId: byId("audioSpeechifyApiVoiceId"),
				voiceIdNotListed: byId("audioSpeechifyApiVoiceIdNotListed"),
			},
		},
		playHt: {
			api: {
				userId: byId("audioPlayHtApiUserId"),
				key: byId("audioPlayHtApiKey"),
				voiceId: byId("audioPlayHtApiVoiceId"),
				voiceIdNotListed: byId("audioPlayHtApiVoiceIdNotListed"),
				quality: byId("audioPlayHtApiQuality"),
				outputFormat: byId("audioPlayHtApiOutputFormat"),
				sampleRate: byId("audioPlayHtApiSampleRate"),
				temperature: byId("audioPlayHtApiTemperature"),
				voiceEngine: byId("audioPlayHtApiVoiceEngine"),
			},
		},
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

/**
 * @type {SortableJS}
 */
let sortableIpaFetchersOrder = null;

/**
 * @type {SortableJS}
 */
let sortableIpaFetchersOrderToText = null;

/**
 * @type {SortableJS}
 */
let sortableAudioFetchersOrder = null;

/**
 * @type {SortableJS}
 */
let sortableAudioFetchersOrderToText = null;

document.addEventListener("DOMContentLoaded", async () => {
	try {

		console.log("Options page entered");

		[
			el.ipa.font.size,
			el.ipa.close.timeout,
			el.audio.volume,
			el.audio.playbackRate,
			el.audio.realVoice.fetchTimeout,
		].forEach(e => onlyNumber(e, true));

		[
			el.general.accessKey,
			el.ipa.close.shortcut,
			el.setPronuncationByShortcut.audioShortcut,
			el.setPronuncationByShortcut.ipaShortcut,
		].forEach(onlyShorcut);

		sortableIpaFetchersOrder = createSortableOrder(
			byId("ipaFetchersOrder"),
			"order",
		);

		sortableIpaFetchersOrderToText = createSortableOrder(
			byId("ipaFetchersOrderToText"),
			"order-to-text",
		);

		sortableAudioFetchersOrder = createSortableOrder(
			byId("audioFetchersOrder"),
			"order",
		);

		sortableAudioFetchersOrderToText = createSortableOrder(
			byId("audioFetchersOrderToText"),
			"order-to-text",
		);

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
			allowText: el.general.allowText.checked,
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
				enabledToText: el.ipa.enabledToText.checked,
				font: {
					family: strOr(el.ipa.font.family.value, defaultOptions.ipa.font.family),
					size: numOr(el.ipa.font.size.value, defaultOptions.ipa.font.size, 2, 50),
					color: strOr(el.ipa.font.color.value, defaultOptions.ipa.font.color),
					backgroundColor: strOr(el.ipa.font.backgroundColor.value, defaultOptions.ipa.font.backgroundColor),
				},
				useContextColors: el.ipa.useContextColors.checked,
				position: {
					menuTriggered: el.ipa.position.menuTriggered.value,
					actionTriggered: el.ipa.position.actionTriggered.value,
				},
				close: {
					timeout: numOr(el.ipa.close.timeout.value, defaultOptions.ipa.close.timeout, 500, 3600000),
					shortcut: strOr(el.ipa.close.shortcut.value, defaultOptions.ipa.close.shortcut),
					onScroll: el.ipa.close.onScroll.checked,
				},
				antvaset: {
					enabled: el.ipa.order.antvasetEnabled.checked,
					order: parseInt(el.ipa.order.antvaset.dataset.order),
				},
				unalengua: {
					enabled: el.ipa.order.unalenguaEnabled.checked,
					order: parseInt(el.ipa.order.unalengua.dataset.order),
					enabledToText: el.ipa.orderToText.unalenguaEnabled.checked,
					orderToText: parseInt(el.ipa.orderToText.unalengua.dataset.orderToText),
				},
				oxford: {
					enabled: el.ipa.order.oxfordEnabled.checked,
					order: parseInt(el.ipa.order.oxford.dataset.order),
				},
				cambridge: {
					enabled: el.ipa.order.cambridgeEnabled.checked,
					order: parseInt(el.ipa.order.cambridge.dataset.order),
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
				enabledToText: el.audio.enabledToText.checked,
				volume: numOr(el.audio.volume.value, defaultOptions.audio.volume, 0, 1),
				playbackRate: numOr(el.audio.playbackRate.value, defaultOptions.audio.playbackRate, 0.2, 2),
				realVoice: {
					enabled: el.audio.order.realVoiceEnabled.checked,
					order: parseInt(el.audio.order.realVoice.dataset.order),
					fetchTimeout: numOr(el.audio.realVoice.fetchTimeout.value, defaultOptions.audio.realVoice.fetchTimeout, 0, 120000),
				},
				googleSpeech: {
					enabled: el.audio.order.googleSpeechEnabled.checked,
					order: parseInt(el.audio.order.googleSpeech.dataset.order),
					enabledToText: el.audio.orderToText.googleSpeechEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.googleSpeech.dataset.orderToText),
					save: el.audio.googleSpeech.save.checked,
				},
				responsiveVoice: {
					enabled: el.audio.order.responsiveVoiceEnabled.checked,
					order: parseInt(el.audio.order.responsiveVoice.dataset.order),
					enabledToText: el.audio.orderToText.responsiveVoiceEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.responsiveVoice.dataset.orderToText),
					api: {
						key: strOr(el.audio.responsiveVoice.api.key.value, defaultOptions.audio.responsiveVoice.api.key),
						gender: strOr(el.audio.responsiveVoice.api.gender.value, defaultOptions.audio.responsiveVoice.api.gender),
					},
				},
				unrealSpeech: {
					enabled: el.audio.order.unrealSpeechEnabled.checked,
					order: parseInt(el.audio.order.unrealSpeech.dataset.order),
					enabledToText: el.audio.orderToText.unrealSpeechEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.unrealSpeech.dataset.orderToText),
					api: {
						token: strOr(el.audio.unrealSpeech.api.token.value, defaultOptions.audio.unrealSpeech.api.token),
						voiceId: strOr(el.audio.unrealSpeech.api.voiceId.value, defaultOptions.audio.unrealSpeech.api.voiceId),
						bitRate: strOr(el.audio.unrealSpeech.api.bitRate.value, defaultOptions.audio.unrealSpeech.api.bitRate),
						pitch: numOr(el.audio.unrealSpeech.api.pitch.value, defaultOptions.audio.unrealSpeech.api.pitch, 0.5, 1.5),
						codec: strOr(el.audio.unrealSpeech.api.codec.value, defaultOptions.audio.unrealSpeech.api.codec),
						temperature: numOr(el.audio.unrealSpeech.api.temperature.value, defaultOptions.audio.unrealSpeech.api.temperature, 0.1, 0.8),
					},
				},
				speechify: {
					enabled: el.audio.order.speechifyEnabled.checked,
					order: parseInt(el.audio.order.speechify.dataset.order),
					enabledToText: el.audio.orderToText.speechifyEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.speechify.dataset.orderToText),
					api: {
						token: strOr(el.audio.speechify.api.token.value, defaultOptions.audio.speechify.api.token),
						voiceId: strOr(
							strOr(
								el.audio.speechify.api.voiceIdNotListed.value,
								el.audio.speechify.api.voiceId.value,
							),
							defaultOptions.audio.speechify.api.voiceId,
						),
					},
				},
				playHt: {
					enabled: el.audio.order.playHtEnabled.checked,
					order: parseInt(el.audio.order.playHt.dataset.order),
					enabledToText: el.audio.orderToText.playHtEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.playHt.dataset.orderToText),
					api: {
						userId: strOr(el.audio.playHt.api.userId.value, defaultOptions.audio.playHt.api.userId),
						key: strOr(el.audio.playHt.api.key.value, defaultOptions.audio.playHt.api.key),
						voiceId: strOr(
							strOr(
								el.audio.playHt.api.voiceIdNotListed.value,
								el.audio.playHt.api.voiceId.value,
							),
							defaultOptions.audio.playHt.api.voiceId,
						),
						quality: strOr(el.audio.playHt.api.quality.value, defaultOptions.audio.playHt.api.quality),
						outputFormat: strOr(el.audio.playHt.api.outputFormat.value, defaultOptions.audio.playHt.api.outputFormat),
						sampleRate: numOr(el.audio.playHt.api.sampleRate.value, defaultOptions.audio.playHt.api.sampleRate, 8000, 48000),
						temperature: numOr(el.audio.playHt.api.temperature.value, defaultOptions.audio.playHt.api.temperature, 0, 2),
						voiceEngine: strOr(el.audio.playHt.api.voiceEngine.value, defaultOptions.audio.playHt.api.voiceEngine),
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
			if (
				options.audio.unrealSpeech.api.key !==
				currOpt.audio.unrealSpeech.api.key &&
				af.AFUnrealSpeech.name in le
			) {
				updateLastError = true;
				delete le[af.AFUnrealSpeech.name];
			}
			if (
				options.audio.speechify.api.token !==
				currOpt.audio.speechify.api.token &&
				af.AFSpeechify.name in le
			) {
				updateLastError = true;
				delete le[af.AFSpeechify.name];
			}
			if (
				options.audio.playHt.api.key !==
				currOpt.audio.playHt.api.key &&
				af.AFPlayHt.name in le
			) {
				updateLastError = true;
				delete le[af.AFPlayHt.name];
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
		const url = browser.runtime.getURL("resources/complete-ipa.json.gz");
		const response = await fetch(url);
		const gzipBuffer = new Uint8Array(await response.arrayBuffer());
		const ipaBuffer = fflate.decompressSync(gzipBuffer);
		const ipaDecoded = new TextDecoder().decode(ipaBuffer);
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
	el.general.allowText.checked = opt.allowText;
	el.ipa.enabled.checked = opt.ipa.enabled;
	el.ipa.enabledToText.checked = opt.ipa.enabledToText;
	el.ipa.font.family.value = opt.ipa.font.family;
	el.ipa.font.size.value = opt.ipa.font.size.toString();
	el.ipa.font.color.value = opt.ipa.font.color;
	el.ipa.font.backgroundColor.value = opt.ipa.font.backgroundColor;
	el.ipa.useContextColors.checked = opt.ipa.useContextColors;
	el.ipa.position.menuTriggered.value = opt.ipa.position.menuTriggered;
	el.ipa.position.actionTriggered.value = opt.ipa.position.actionTriggered;
	el.ipa.close.timeout.value = opt.ipa.close.timeout.toString();
	el.ipa.close.shortcut.value = opt.ipa.close.shortcut;
	el.ipa.close.onScroll.checked = opt.ipa.close.onScroll;
	el.ipa.order.antvasetEnabled.checked = opt.ipa.antvaset.enabled;
	el.ipa.order.unalenguaEnabled.checked = opt.ipa.unalengua.enabled;
	el.ipa.order.oxfordEnabled.checked = opt.ipa.oxford.enabled;
	el.ipa.order.cambridgeEnabled.checked = opt.ipa.cambridge.enabled;
	el.ipa.orderToText.unalenguaEnabled.checked = opt.ipa.unalengua.enabledToText;
	el.audio.enabled.checked = opt.audio.enabled;
	el.audio.enabledToText.checked = opt.audio.enabledToText;
	el.audio.volume.value = opt.audio.volume.toString();
	el.audio.playbackRate.value = opt.audio.playbackRate.toString();
	el.audio.order.realVoiceEnabled.checked = opt.audio.realVoice.enabled;
	el.audio.order.googleSpeechEnabled.checked = opt.audio.googleSpeech.enabled;
	el.audio.order.responsiveVoiceEnabled.checked = opt.audio.responsiveVoice.enabled;
	el.audio.orderToText.googleSpeechEnabled.checked = opt.audio.googleSpeech.enabledToText;
	el.audio.orderToText.responsiveVoiceEnabled.checked = opt.audio.responsiveVoice.enabledToText;
	el.audio.realVoice.fetchTimeout.value = opt.audio.realVoice.fetchTimeout.toString();
	el.audio.googleSpeech.save.checked = opt.audio.googleSpeech.save;
	el.audio.responsiveVoice.api.key.value = opt.audio.responsiveVoice.api.key;
	el.audio.responsiveVoice.api.gender.value = opt.audio.responsiveVoice.api.gender;
	el.audio.unrealSpeech.api.token.value = opt.audio.unrealSpeech.api.token ?? "";
	el.audio.unrealSpeech.api.voiceId.value = opt.audio.unrealSpeech.api.voiceId;
	el.audio.unrealSpeech.api.bitRate.value = opt.audio.unrealSpeech.api.bitRate;
	el.audio.unrealSpeech.api.pitch.value = opt.audio.unrealSpeech.api.pitch.toString();
	el.audio.unrealSpeech.api.codec.value = opt.audio.unrealSpeech.api.codec;
	el.audio.unrealSpeech.api.temperature.value = opt.audio.unrealSpeech.api.temperature.toString();
	el.audio.speechify.api.token.value = opt.audio.speechify.api.token ?? "";
	el.audio.speechify.api.voiceId.value = opt.audio.speechify.api.voiceId;
	el.audio.playHt.api.userId.value = opt.audio.playHt.api.userId ?? "";
	el.audio.playHt.api.key.value = opt.audio.playHt.api.key ?? "";
	el.audio.playHt.api.voiceId.value = opt.audio.playHt.api.voiceId;
	el.audio.playHt.api.quality.value = opt.audio.playHt.api.quality;
	el.audio.playHt.api.outputFormat.value = opt.audio.playHt.api.outputFormat;
	el.audio.playHt.api.sampleRate.value = (opt.audio.playHt.api.sampleRate ?? "").toString();
	el.audio.playHt.api.temperature.value = (opt.audio.playHt.api.temperature ?? "").toString();
	el.audio.playHt.api.voiceEngine.value = opt.audio.playHt.api.voiceEngine;
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

	sortSortableOrder(
		sortableIpaFetchersOrder,
		el.ipa.order,
		opt.ipa,
		"order",
	);

	sortSortableOrder(
		sortableIpaFetchersOrderToText,
		el.ipa.orderToText,
		opt.ipa,
		"order-to-text",
	);

	sortSortableOrder(
		sortableAudioFetchersOrder,
		el.audio.order,
		opt.audio,
		"order",
	);

	sortSortableOrder(
		sortableAudioFetchersOrderToText,
		el.audio.orderToText,
		opt.audio,
		"order-to-text",
	);

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
 * @param {string | null} defaultValue
 * @returns {string | null}
 */
function strOr(value, defaultValue) {
	return value.trim() || defaultValue;
}

/**
 * @param {string} value
 * @param {number | null} defaultValue
 * @param {number} min
 * @param {number} max
 * @returns {number | null}
 */
function numOr(value, defaultValue, min=0, max=Number.MAX_VALUE) {
	const trimmed = value.trim();
	const num = trimmed.length > 0 ? parseFloat(trimmed) : defaultValue;
	return (
		defaultValue !== null && defaultValue !== undefined ?
		threshold(min, max, num) :
		null
	);
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

/**
 * @param {HTMLElement} list
 * @param {string} dataIdAttrSuffix
 * @returns {SortableJS}
 */
function createSortableOrder(list, dataIdAttrSuffix="order") {
	const dataIdAttr = `data-${dataIdAttrSuffix}`;
	const datasetKey = kebab2camel(dataIdAttrSuffix);
	return Sortable.create(list, {
		animation: 150,
		ghostClass: "dragging",
		dataIdAttr: dataIdAttr,
		forceFallback: true,
		onEnd: () => {
			const children = Array.from(
				list.querySelectorAll(`[${dataIdAttr}]`),
			);
			for (const [index, element] of children.entries()) {
				const order = index + 1;
				element.dataset[datasetKey] = order
					.toString()
					.padStart(2, "0");
			}
		},
	});
}

/**
 * @param {SortableJS} sortable
 * @param {{ [key: string]: HTMLElement }} items
 * @param {{ [key: string]: { [key: string]: number } }} initialOrder
 * @param {string} dataIdAttrSuffix
 * @returns {void}
 */
function sortSortableOrder(sortable, items, initialOrder, dataIdAttrSuffix="order") {
	const datasetKey = kebab2camel(dataIdAttrSuffix);
	for (const [key, value] of Object.entries(items)) {
		if (key in initialOrder) {
			const order = initialOrder[key][datasetKey];
			value.dataset[datasetKey] = order
				.toString()
				.padStart(2, "0");
		}
	}
	sortable.sort(sortable.toArray().toSorted(), false);
}
