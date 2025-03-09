import "../utils/fflate.js";
import "../utils/Sortable.min.js";
import * as af from "../audio-fetcher/fetchers.js";
import defaultOptions from "../utils/default-options.js";
import { deepMerge }  from "../utils/object.js";
import { showPopup } from "../utils/show-popup.js";
import { threshold } from "../utils/number.js";
import {
	generateSha1,
	kebab2camel,
	removeExtraSpaces,
	splitWords,
} from "../utils/string.js";
import {
	addonStorage,
	audioTable,
	audioTextTable,
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
 *             buttonColor: HTMLInputElement,
 *             buttonHoverColor: HTMLInputElement,
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
 *         saveTextAudio: HTMLInputElement,
 *         playerEnabledToText: HTMLInputElement,
 *         shortcutsEnabledToText: HTMLInputElement,
 *         volume: HTMLInputElement,
 *         playbackRate: HTMLInputElement,
 *         shortcuts: {
 *             togglePlayer: HTMLInputElement,
 *             togglePlay: HTMLInputElement,
 *             toggleMute: HTMLInputElement,
 *             rewind: HTMLInputElement,
 *             previous: HTMLInputElement,
 *             next: HTMLInputElement,
 *             backward: HTMLInputElement,
 *             forward: HTMLInputElement,
 *             decreaseVolume: HTMLInputElement,
 *             increaseVolume: HTMLInputElement,
 *             decreaseSpeed: HTMLInputElement,
 *             increaseSpeed: HTMLInputElement,
 *             resetSpeed: HTMLInputElement,
 *         },
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
 *             elevenLabs: HTMLElement,
 *             elevenLabsEnabled: HTMLInputElement,
 *             amazonPolly: HTMLElement,
 *             amazonPollyEnabled: HTMLInputElement,
 *             openAi: HTMLElement,
 *             openAiEnabled: HTMLInputElement,
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
 *             elevenLabs: HTMLElement,
 *             elevenLabsEnabled: HTMLInputElement,
 *             amazonPolly: HTMLElement,
 *             amazonPollyEnabled: HTMLInputElement,
 *             openAi: HTMLElement,
 *             openAiEnabled: HTMLInputElement,
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
 *         elevenLabs: {
 *             api: {
 *                 key: HTMLInputElement,
 *                 voiceId: HTMLSelectElement,
 *                 voiceIdNotListed: HTMLInputElement,
 *                 outputFormat: HTMLSelectElement,
 *                 modelId: HTMLSelectElement,
 *                 applyTextNormalization: HTMLSelectElement,
 *             },
 *         },
 *         amazonPolly: {
 *             api: {
 *                 accessKeyId: HTMLInputElement,
 *                 secretAccessKey: HTMLInputElement,
 *                 endpoint: HTMLSelectElement,
 *                 engine: HTMLSelectElement,
 *                 outputFormat: HTMLSelectElement,
 *                 sampleRate: HTMLSelectElement,
 *                 voiceId: HTMLSelectElement,
 *                 voiceIdNotListed: HTMLInputElement,
 *             },
 *         },
 *         openAi: {
 *             api: {
 *                 key: HTMLInputElement,
 *                 model: HTMLSelectElement,
 *                 voice: HTMLSelectElement,
 *                 responseFormat: HTMLSelectElement,
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
 *     setCustomAudioText: {
 *         text: HTMLInputElement,
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
 *         audioText: HTMLButtonElement,
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
 *     clearStorage: {
 *         ipa: HTMLButtonElement,
 *         audio: HTMLButtonElement,
 *         audioText: HTMLButtonElement,
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
			buttonColor: byId("ipaButtonColor"),
			buttonHoverColor: byId("ipaButtonHoverColor"),
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
		saveTextAudio: byId("audioSaveTextAudio"),
		playerEnabledToText: byId("audioPlayerEnabledToText"),
		shortcutsEnabledToText: byId("audioShortcutsEnabledToText"),
		volume: byId("audioVolume"),
		playbackRate: byId("audioPlaybackRate"),
		shortcuts: {
			togglePlayer: byId("audioShortcutTogglePlayer"),
			togglePlay: byId("audioShortcutTogglePlay"),
			toggleMute: byId("audioShortcutToggleMute"),
			rewind: byId("audioShortcutRewind"),
			previous: byId("audioShortcutPrevious"),
			next: byId("audioShortcutNext"),
			backward: byId("audioShortcutBackward"),
			forward: byId("audioShortcutForward"),
			decreaseVolume: byId("audioShortcutDecreaseVolume"),
			increaseVolume: byId("audioShortcutIncreaseVolume"),
			decreaseSpeed: byId("audioShortcutDecreaseSpeed"),
			increaseSpeed: byId("audioShortcutIncreaseSpeed"),
			resetSpeed: byId("audioShortcutResetSpeed"),
		},
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
			elevenLabs: byId("audioElevenLabsOrder"),
			elevenLabsEnabled: byId("audioElevenLabsEnabled"),
			amazonPolly: byId("audioAmazonPollyOrder"),
			amazonPollyEnabled: byId("audioAmazonPollyEnabled"),
			openAi: byId("audioOpenAiOrder"),
			openAiEnabled: byId("audioOpenAiEnabled"),
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
			elevenLabs: byId("audioElevenLabsOrderToText"),
			elevenLabsEnabled: byId("audioElevenLabsEnabledToText"),
			amazonPolly: byId("audioAmazonPollyOrderToText"),
			amazonPollyEnabled: byId("audioAmazonPollyEnabledToText"),
			openAi: byId("audioOpenAiOrderToText"),
			openAiEnabled: byId("audioOpenAiEnabledToText"),
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
		elevenLabs: {
			api: {
				key: byId("audioElevenLabsApiKey"),
				voiceId: byId("audioElevenLabsApiVoiceId"),
				voiceIdNotListed: byId("audioElevenLabsApiVoiceIdNotListed"),
				outputFormat: byId("audioElevenLabsApiOutputFormat"),
				modelId: byId("audioElevenLabsApiModelId"),
				applyTextNormalization: byId("audioElevenLabsApiApplyTextNormalization"),
			},
		},
		amazonPolly: {
			api: {
				accessKeyId: byId("audioAmazonPollyApiAccessKeyId"),
				secretAccessKey: byId("audioAmazonPollyApiSecretAccessKey"),
				endpoint: byId("audioAmazonPollyApiEndpoint"),
				engine: byId("audioAmazonPollyApiEngine"),
				outputFormat: byId("audioAmazonPollyApiOutputFormat"),
				sampleRate: byId("audioAmazonPollyApiSampleRate"),
				voiceId: byId("audioAmazonPollyApiVoiceId"),
				voiceIdNotListed: byId("audioAmazonPollyApiVoiceIdNotListed"),
			},
		},
		openAi: {
			api: {
				key: byId("audioOpenAiApiKey"),
				model: byId("audioOpenAiApiModel"),
				voice: byId("audioOpenAiApiVoice"),
				responseFormat: byId("audioOpenAiApiResponseFormat"),
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
	setCustomAudioText: {
		text: byId("setCustomAudioText"),
		file: byId("setCustomAudioTextFile"),
		save: byId("saveCustomAudioText"),
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
		audioText: byId("downloadAudioTextStorage"),
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
	clearStorage: {
		ipa: byId("clearIpaStorage"),
		audio: byId("clearAudioStorage"),
		audioText: byId("clearAudioTextStorage"),
		errors: byId("clearErrorsStorage"),
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

		[
			el.audio.shortcuts.togglePlayer,
			el.audio.shortcuts.togglePlay,
			el.audio.shortcuts.toggleMute,
			el.audio.shortcuts.rewind,
			el.audio.shortcuts.previous,
			el.audio.shortcuts.next,
			el.audio.shortcuts.backward,
			el.audio.shortcuts.forward,
			el.audio.shortcuts.decreaseVolume,
			el.audio.shortcuts.increaseVolume,
			el.audio.shortcuts.decreaseSpeed,
			el.audio.shortcuts.increaseSpeed,
			el.audio.shortcuts.resetSpeed,
		].forEach(e => onlyShorcut(e, true));

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
					buttonColor: strOr(el.ipa.close.buttonColor.value, defaultOptions.ipa.close.buttonColor),
					buttonHoverColor: strOr(el.ipa.close.buttonHoverColor.value, defaultOptions.ipa.close.buttonHoverColor),
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
				saveTextAudio: el.audio.saveTextAudio.checked,
				playerEnabledToText: el.audio.playerEnabledToText.checked,
				shortcutsEnabledToText: el.audio.shortcutsEnabledToText.checked,
				volume: numOr(el.audio.volume.value, defaultOptions.audio.volume, 0, 1),
				playbackRate: numOr(el.audio.playbackRate.value, defaultOptions.audio.playbackRate, 0.2, 2),
				shortcuts: {
					togglePlayer: strOr(el.audio.shortcuts.togglePlayer.value, defaultOptions.audio.shortcuts.togglePlayer),
					togglePlay: strOr(el.audio.shortcuts.togglePlay.value, defaultOptions.audio.shortcuts.togglePlay),
					toggleMute: strOr(el.audio.shortcuts.toggleMute.value, defaultOptions.audio.shortcuts.toggleMute),
					rewind: strOr(el.audio.shortcuts.rewind.value, defaultOptions.audio.shortcuts.rewind),
					previous: strOr(el.audio.shortcuts.previous.value, defaultOptions.audio.shortcuts.previous),
					next: strOr(el.audio.shortcuts.next.value, defaultOptions.audio.shortcuts.next),
					backward: strOr(el.audio.shortcuts.backward.value, defaultOptions.audio.shortcuts.backward),
					forward: strOr(el.audio.shortcuts.forward.value, defaultOptions.audio.shortcuts.forward),
					decreaseVolume: strOr(el.audio.shortcuts.decreaseVolume.value, defaultOptions.audio.shortcuts.decreaseVolume),
					increaseVolume: strOr(el.audio.shortcuts.increaseVolume.value, defaultOptions.audio.shortcuts.increaseVolume),
					decreaseSpeed: strOr(el.audio.shortcuts.decreaseSpeed.value, defaultOptions.audio.shortcuts.decreaseSpeed),
					increaseSpeed: strOr(el.audio.shortcuts.increaseSpeed.value, defaultOptions.audio.shortcuts.increaseSpeed),
					resetSpeed: strOr(el.audio.shortcuts.resetSpeed.value, defaultOptions.audio.shortcuts.resetSpeed),
				},
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
				elevenLabs: {
					enabled: el.audio.order.elevenLabsEnabled.checked,
					order: parseInt(el.audio.order.elevenLabs.dataset.order),
					enabledToText: el.audio.orderToText.elevenLabsEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.elevenLabs.dataset.orderToText),
					api: {
						key: strOr(el.audio.elevenLabs.api.key.value, defaultOptions.audio.elevenLabs.api.key),
						voiceId: strOr(
							strOr(
								el.audio.elevenLabs.api.voiceIdNotListed.value,
								el.audio.elevenLabs.api.voiceId.value,
							),
							defaultOptions.audio.elevenLabs.api.voiceId,
						),
						outputFormat: strOr(el.audio.elevenLabs.api.outputFormat.value, defaultOptions.audio.elevenLabs.api.outputFormat),
						modelId: strOr(el.audio.elevenLabs.api.modelId.value, defaultOptions.audio.elevenLabs.api.modelId),
						applyTextNormalization: strOr(el.audio.elevenLabs.api.applyTextNormalization.value, defaultOptions.audio.elevenLabs.api.applyTextNormalization),
					},
				},
				amazonPolly: {
					enabled: el.audio.order.amazonPollyEnabled.checked,
					order: parseInt(el.audio.order.amazonPolly.dataset.order),
					enabledToText: el.audio.orderToText.amazonPollyEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.amazonPolly.dataset.orderToText),
					api: {
						accessKeyId: strOr(el.audio.amazonPolly.api.accessKeyId.value, defaultOptions.audio.amazonPolly.api.accessKeyId),
						secretAccessKey: strOr(el.audio.amazonPolly.api.secretAccessKey.value, defaultOptions.audio.amazonPolly.api.secretAccessKey),
						endpoint: strOr(el.audio.amazonPolly.api.endpoint.value, defaultOptions.audio.amazonPolly.api.endpoint),
						engine: strOr(el.audio.amazonPolly.api.engine.value, defaultOptions.audio.amazonPolly.api.engine),
						outputFormat: strOr(el.audio.amazonPolly.api.outputFormat.value, defaultOptions.audio.amazonPolly.api.outputFormat),
						sampleRate: strOr(el.audio.amazonPolly.api.sampleRate.value, defaultOptions.audio.amazonPolly.api.sampleRate),
						voiceId: strOr(
							strOr(
								el.audio.amazonPolly.api.voiceIdNotListed.value,
								el.audio.amazonPolly.api.voiceId.value,
							),
							defaultOptions.audio.amazonPolly.api.voiceId,
						),
					},
				},
				openAi: {
					enabled: el.audio.order.openAiEnabled.checked,
					order: parseInt(el.audio.order.openAi.dataset.order),
					enabledToText: el.audio.orderToText.openAiEnabled.checked,
					orderToText: parseInt(el.audio.orderToText.openAi.dataset.orderToText),
					api: {
						key: strOr(el.audio.openAi.api.key.value, defaultOptions.audio.openAi.api.key),
						model: strOr(el.audio.openAi.api.model.value, defaultOptions.audio.openAi.api.model),
						voice: strOr(el.audio.openAi.api.voice.value, defaultOptions.audio.openAi.api.voice),
						responseFormat: strOr(el.audio.openAi.api.responseFormat.value, defaultOptions.audio.openAi.api.responseFormat),
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
				af.AFResponsiveVoice.name in le &&
				options.audio.responsiveVoice.api.key !==
				currOpt.audio.responsiveVoice.api.key
			) {
				updateLastError = true;
				delete le[af.AFResponsiveVoice.name];
			}
			if (
				af.AFUnrealSpeech.name in le &&
				options.audio.unrealSpeech.api.key !==
				currOpt.audio.unrealSpeech.api.key
			) {
				updateLastError = true;
				delete le[af.AFUnrealSpeech.name];
			}
			if (
				af.AFSpeechify.name in le &&
				options.audio.speechify.api.token !==
				currOpt.audio.speechify.api.token
			) {
				updateLastError = true;
				delete le[af.AFSpeechify.name];
			}
			if (
				af.AFPlayHt.name in le &&
				options.audio.playHt.api.key !==
				currOpt.audio.playHt.api.key
			) {
				updateLastError = true;
				delete le[af.AFPlayHt.name];
			}
			if (
				af.AFElevenLabs.name in le &&
				options.audio.elevenLabs.api.key !==
				currOpt.audio.elevenLabs.api.key
			) {
				updateLastError = true;
				delete le[af.AFElevenLabs.name];
			}
			if (
				af.AFAmazonPolly.name in le &&
				(
					options.audio.amazonPolly.api.accessKeyId !==
					currOpt.audio.amazonPolly.api.accessKeyId ||
					options.audio.amazonPolly.api.secretAccessKey !==
					currOpt.audio.amazonPolly.api.secretAccessKey
				)
			) {
				updateLastError = true;
				delete le[af.AFAmazonPolly.name];
			}
			if (
				af.AFOpenAi.name in le &&
				options.audio.openAi.api.key !==
				currOpt.audio.openAi.api.key
			) {
				updateLastError = true;
				delete le[af.AFOpenAi.name];
			}
			if (updateLastError) {
				await controlTable.set(leKey, le);
			}
		} catch (error) {
			console.error(error);
		}
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
			audio.pause();
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

el.setCustomAudioText.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		const rawText = el.setCustomAudioText.text.value.trim();
		if (rawText.length === 0) {
			showInfo(currentTarget, "No text was found in input");
			return;
		}
		const key = await generateSha1(removeExtraSpaces(rawText));
		const file = el.setCustomAudioText.file.files?.[0];
		if (!file) {
			showInfo(currentTarget, "No file was found in input");
			return;
		}
		const mb = file.size / 1000 / 1000;
		if (mb > 500) {
			showInfo(currentTarget, `File max size is 500MB, but this has ${mb}MB`);
			return;
		}
		try {
			const base64 = await blob2base64(file);
			const audio = new Audio(base64);
			audio.volume = 0;
			await audio.play();
			audio.pause();
			await audioTextTable.set(key, base64);
			await setFieldsValues();
			showInfo(currentTarget, `${key} audio text saved`);
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

el.downloadStorage.audioText.addEventListener("click", async () => {
	try {
		const audioTextStorage = await audioTextTable.getAll();
		await downloadObject(audioTextStorage, fileName("pronunciation-audio-text-storage.json"));
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

el.clearStorage.ipa.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear IPA storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await ipaTable.clear();
		await setFieldsValues();
		showInfo(currentTarget, "IPA storage cleared");
	} catch (error) {
		console.error(error);
	}
});

el.clearStorage.audio.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear audio storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await audioTable.clear();
		await setFieldsValues();
		showInfo(currentTarget, "Audio storage cleared");
	} catch (error) {
		console.error(error);
	}
});

el.clearStorage.audioText.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear audio text storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await audioTextTable.clear();
		await setFieldsValues();
		showInfo(currentTarget, "Audio text storage cleared");
	} catch (error) {
		console.error(error);
	}
});

el.clearStorage.errors.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear errors storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await errorsTable.clear();
		await setFieldsValues();
		showInfo(currentTarget, "Errors storage cleared");
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
	el.ipa.close.buttonColor.value = opt.ipa.close.buttonColor;
	el.ipa.close.buttonHoverColor.value = opt.ipa.close.buttonHoverColor;
	el.ipa.order.antvasetEnabled.checked = opt.ipa.antvaset.enabled;
	el.ipa.order.unalenguaEnabled.checked = opt.ipa.unalengua.enabled;
	el.ipa.order.oxfordEnabled.checked = opt.ipa.oxford.enabled;
	el.ipa.order.cambridgeEnabled.checked = opt.ipa.cambridge.enabled;
	el.ipa.orderToText.unalenguaEnabled.checked = opt.ipa.unalengua.enabledToText;
	el.audio.enabled.checked = opt.audio.enabled;
	el.audio.enabledToText.checked = opt.audio.enabledToText;
	el.audio.saveTextAudio.checked = opt.audio.saveTextAudio;
	el.audio.playerEnabledToText.checked = opt.audio.playerEnabledToText;
	el.audio.shortcutsEnabledToText.checked = opt.audio.shortcutsEnabledToText;
	el.audio.volume.value = opt.audio.volume.toString();
	el.audio.playbackRate.value = opt.audio.playbackRate.toString();
	el.audio.shortcuts.togglePlayer.value = opt.audio.shortcuts.togglePlayer;
	el.audio.shortcuts.togglePlay.value = opt.audio.shortcuts.togglePlay;
	el.audio.shortcuts.toggleMute.value = opt.audio.shortcuts.toggleMute;
	el.audio.shortcuts.rewind.value = opt.audio.shortcuts.rewind;
	el.audio.shortcuts.previous.value = opt.audio.shortcuts.previous;
	el.audio.shortcuts.next.value = opt.audio.shortcuts.next;
	el.audio.shortcuts.backward.value = opt.audio.shortcuts.backward;
	el.audio.shortcuts.forward.value = opt.audio.shortcuts.forward;
	el.audio.shortcuts.decreaseVolume.value = opt.audio.shortcuts.decreaseVolume;
	el.audio.shortcuts.increaseVolume.value = opt.audio.shortcuts.increaseVolume;
	el.audio.shortcuts.decreaseSpeed.value = opt.audio.shortcuts.decreaseSpeed;
	el.audio.shortcuts.increaseSpeed.value = opt.audio.shortcuts.increaseSpeed;
	el.audio.shortcuts.resetSpeed.value = opt.audio.shortcuts.resetSpeed;
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
	el.audio.elevenLabs.api.key.value = opt.audio.elevenLabs.api.key ?? "";
	el.audio.elevenLabs.api.voiceId.value = opt.audio.elevenLabs.api.voiceId;
	el.audio.elevenLabs.api.outputFormat.value = opt.audio.elevenLabs.api.outputFormat;
	el.audio.elevenLabs.api.modelId.value = opt.audio.elevenLabs.api.modelId;
	el.audio.elevenLabs.api.applyTextNormalization.value = opt.audio.elevenLabs.api.applyTextNormalization;
	el.audio.amazonPolly.api.accessKeyId.value = opt.audio.amazonPolly.api.accessKeyId ?? "";
	el.audio.amazonPolly.api.secretAccessKey.value = opt.audio.amazonPolly.api.secretAccessKey ?? "";
	el.audio.amazonPolly.api.endpoint.value = opt.audio.amazonPolly.api.endpoint;
	el.audio.amazonPolly.api.engine.value = opt.audio.amazonPolly.api.engine;
	el.audio.amazonPolly.api.outputFormat.value = opt.audio.amazonPolly.api.outputFormat;
	el.audio.amazonPolly.api.sampleRate.value = opt.audio.amazonPolly.api.sampleRate;
	el.audio.amazonPolly.api.voiceId.value = opt.audio.amazonPolly.api.voiceId;
	el.audio.openAi.api.key.value = opt.audio.openAi.api.key ?? "";
	el.audio.openAi.api.model.value = opt.audio.openAi.api.model;
	el.audio.openAi.api.voice.value = opt.audio.openAi.api.voice;
	el.audio.openAi.api.responseFormat.value = opt.audio.openAi.api.responseFormat;
	el.setPronuncationByShortcut.enabled.checked = opt.setPronuncationByShortcut.enabled;
	el.setPronuncationByShortcut.ipaShortcut.value = opt.setPronuncationByShortcut.ipaShortcut;
	el.setPronuncationByShortcut.audioShortcut.value = opt.setPronuncationByShortcut.audioShortcut;
	el.setPronuncationByShortcut.restoreDefaultIpaShortcut.value = opt.setPronuncationByShortcut.restoreDefaultIpaShortcut;
	el.setCustomIpa.word.value = "";
	el.setCustomIpa.ipa.value = "";
	el.setCustomAudio.word.value = "";
	el.setCustomAudio.file.value = "";
	el.setCustomAudioText.text.value = "";
	el.setCustomAudioText.file.value = "";
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
