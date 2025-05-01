import * as as from "../audio-source/sources.js";
import * as is from "../ipa-source/sources.js";
import { addLoudnessLimiter } from "../utils/audio.js";
import { blob2base64 } from "../utils/element.js";
import { cachedAnalyseWord } from "../utils/analyse-word.js";
import { deepEquals, deepMerge, removeMethods } from "../utils/object.js";
import { goString } from "../utils/promise.js";
import { migrateToV3, migrateToV3_2_0 } from "./migrations.js";
import { threshold } from "../utils/number.js";
import {
	generateSha1,
	removeExtraSpaces,
	splitWords,
} from "../utils/string.js";

export default class Addon {

	/**
	 * @param {{
	 *     defaultOptions: Options,
	 *     audioTable: Table,
	 *     audioCache: MemoryCache,
	 *     ipaTable: Table,
	 *     ipaCache: MemoryCache,
	 *     defaultIpaTable: Table,
	 *     optionsTable: Table,
	 *     optionsCache: MemoryCache,
	 *     defaultOptionsTable: Table,
	 *     controlTable: Table,
	 *     errorsTable: Table,
	 *     sourceLastErrorTable: Table,
	 *     audioTextTable: Table,
	 *     audioTextCache: MemoryCache,
	 *     ipaTextCache: MemoryCache,
	 * }}
	 */
	constructor({
		defaultOptions,
		audioTable,
		audioCache,
		ipaTable,
		ipaCache,
		defaultIpaTable,
		optionsTable,
		optionsCache,
		defaultOptionsTable,
		controlTable,
		errorsTable,
		sourceLastErrorTable,
		audioTextTable,
		audioTextCache,
		ipaTextCache,
	}) {
		this.defaultOptions = defaultOptions;
		this.audioTable = audioTable;
		this.audioCache = audioCache;
		this.ipaTable = ipaTable;
		this.ipaCache = ipaCache;
		this.defaultIpaTable = defaultIpaTable;
		this.optionsTable = optionsTable;
		this.optionsCache = optionsCache;
		this.defaultOptionsTable = defaultOptionsTable;
		this.controlTable = controlTable;
		this.errorsTable = errorsTable;
		this.sourceLastErrorTable = sourceLastErrorTable;
		this.audioTextTable = audioTextTable;
		this.audioTextCache = audioTextCache;
		this.ipaTextCache = ipaTextCache;
	}

	/**
	 * @param {string} input
	 * @param {number} tabId
	 * @param {"menuItem" | "action" | "other"} origin
	 * @returns {Promise<void>}
	 */
	async pronounce(input, tabId, origin) {
		/**
		  * @type {Options}
		  */
		const options = this.optionsCache.getAll();
		const words = splitWords(input.toLowerCase());
		let isText = false;
		let sourceAudioId = null;
		let sourceAudioTitle = null;
		console.log({ input, words });
		if (words.length === 0) {
			console.log("No word was found in input");
			return;
		}
		/**
		  * @type {Promise<string | null> | null}
		  */
		let ipaPromise = null;
		/**
		  * @type {Promise<HTMLAudioElement | null> | null}
		  */
		let audioPromise = null;
		if (words.length === 1 || !options.allowText) {
			const word = words[0];
			const maxCharacters = 60;
			if (word.length <= maxCharacters) {
				const analysis = await cachedAnalyseWord(word);
				console.log({ analysis });
				ipaPromise = this.fetchIpa({
					word,
					options: options.ipa,
					analysis,
					tabId,
					origin,
				});
				audioPromise = this.fetchAudio({
					word,
					options: options.audio,
					analysis,
					tabId,
					origin,
				});
			} else {
				const message = (
					`Exceeded ${maxCharacters} characters allowed for words`
				);
				console.error(message);
				ipaPromise = Promise.resolve(message);
			}
		} else if (options.allowText) {
			const text = removeExtraSpaces(input);
			const key = await generateSha1(text);
			console.log({ textKey: key, textLength: text.length });
			isText = true;
			sourceAudioId = key;
			sourceAudioTitle = text;
			if (sourceAudioTitle.length > 80) {
				const begin = text.slice(0, 60);
				const end = text.slice(-17);
				sourceAudioTitle = `${begin}...${end}`;
			}
			ipaPromise = this.fetchIpaText({
				cacheKey: key,
				input: text,
				options: options.ipa,
				totalWords: words.length,
				tabId,
				origin,
			});
			audioPromise = this.fetchAudioText({
				cacheKey: key,
				input: text,
				options: options.audio,
				tabId,
				origin,
			});
		}
		await Promise.all([
			this.showIpa({
				ipaPromise,
				options: options.ipa,
				tabId,
				origin,
			}),
			this.playAudio({
				audioPromise,
				options: options.audio,
				tabId,
				origin,
				isText,
				sourceId: sourceAudioId,
				sourceTitle: sourceAudioTitle,
			}),
		]);
		console.log("Pronunciation end");
	}

	/**
	 * @param {{
	 *     ipaPromise: Promise<string | null> | null,
	 *     options: OptionsIpa,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<void>}
	 */
	async showIpa({ ipaPromise, options, tabId, origin }) {
		try {
			const ipa = ipaPromise !== null ? await ipaPromise : null;
			if (!ipa) {
				console.log("No IPA was found or show IPA is disabled");
				return;
			}
			console.log({ ipa, tabId });
			/**
			 * @type {BackgroundMessage}
			 */
			const message = {
				type: "showIpa",
				origin,
				showIpa: { ipa, options },
			};
			await browser.tabs.sendMessage(tabId, message);
		} catch (error) {
			await this.saveError("showIpa", error);
		}
	}

	/**
	 * @param {{
	 *     audioPromise: Promise<HTMLAudioElement | null> | null,
	 *     options: OptionsAudio,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 *     isText: boolean,
	 *     sourceId?: string,
	 *     sourceTitle?: string,
	 * }}
	 * @returns {Promise<void>}
	 */
	async playAudio({
		audioPromise,
		options,
		tabId,
		origin,
		isText,
		sourceId,
		sourceTitle,
	}) {
		try {
			const audio = audioPromise !== null ? await audioPromise : null;
			const tab = await browser.tabs.get(tabId);
			const muted = tab?.mutedInfo?.muted;
			if (!audio || muted) {
				const msg = (
					!muted ?
					"No audio was found or play audio is disabled" :
					`Tab ${tabId} is muted`
				);
				console.log(msg);
				return;
			}
			audio.volume = threshold(
				0,
				1,
				options.volume,
			);
			audio.playbackRate = threshold(
				0.2,
				2.0,
				options.playbackRate,
			);
			let playInBackground = (
				!isText ||
				(
					!options.text.playerEnabled &&
					!options.text.shortcutsEnabled
				)
			);
			if (!playInBackground) {
				/**
				 * @type {BackgroundMessage}
				 */
				const message = {
					type: "playAudio",
					origin,
					playAudio: {
						source: {
							id: sourceId,
							title: sourceTitle,
							url: audio.src,
						},
						limitLoudness: options.text.limitLoudness,
						playerEnabled: options.text.playerEnabled,
						shortcutsEnabled: options.text.shortcutsEnabled,
						skipSeconds: options.text.skipSeconds,
						shortcuts: options.text.shortcuts,
					},
				};
				try {
					await browser.tabs.sendMessage(tabId, message);
				} catch (error) {
					console.error(error);
					playInBackground = true;
				}
			}
			if (playInBackground) {
				if (options.limitLoudness) {
					await addLoudnessLimiter(audio).play();
				} else {
					await audio.play();
				}
			}
		} catch (error) {
			await this.saveError("playAudio", error);
		}
	}

	/**
	 * @param {{
	 *     word: string,
	 *     options: OptionsIpa,
	 *     analysis: WordAnalyse,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<string | null>}
	 */
	async fetchIpa({ word, options, analysis, tabId, origin }) {
		if (!options.enabled) {
			console.log("Show IPA is disabled");
			return null;
		}
		/**
		  * @type {string | null}
		  */
		let ipa = this.ipaTextCache.get(word) ?? null;
		if (ipa) {
			return ipa;
		}
		ipa = await this.ipaTable.getValue(word);
		if (!ipa) {
			const { ipa: ipaValue, save } = await this.fetchIpaExternally({
				input: word,
				options,
				analysis,
				toText: false,
				tabId,
				origin,
			});
			ipa = ipaValue;
			if (!ipa) {
				return null;
			}
			if (save) {
				console.log(`Adding ${word} to ipa storage`);
				await this.ipaTable.set(word, ipa);
			}
		}
		this.ipaCache.set(word, ipa);
		return ipa;
	}

	/**
	 * @param {{
	 *     cacheKey: string,
	 *     input: string,
	 *     options: OptionsIpa,
	 *     totalWords: number,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<string | null>}
	 */
	async fetchIpaText({
		cacheKey,
		input,
		options,
		totalWords,
		tabId,
		origin,
	}) {
		if (!options.text.enabled) {
			console.log("Show IPA is disabled to text");
			return null;
		}
		options.close.timeout = threshold(
			options.close.timeout,
			Math.max(300000, options.close.timeout),
			options.close.timeout / 2.5 * totalWords,
		);
		options.close.onScroll = false;
		if (!this.ipaTextCache.hasKey(cacheKey)) {
			const { ipa } = await this.fetchIpaExternally({
				input,
				options,
				analysis: {
					root: "",
					confidence: 1,
					type: "Text",
					isNoun: false,
					isVerb: false,
					isValid: true,
					isText: true,
				},
				toText: true,
				tabId,
				origin,
			});
			if (!ipa) {
				return null;
			}
			this.ipaTextCache.set(cacheKey, ipa);
		}
		return this.ipaTextCache.get(cacheKey);
	}

	/**
	 * @param {{
	 *     input: string,
	 *     options: OptionsIpa,
	 *     analysis: WordAnalyse,
	 *     toText: boolean,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<{ ipa: string | null, save: boolean }>
	 */
	async fetchIpaExternally({
		input,
		options,
		analysis,
		toText,
		tabId,
		origin,
	}) {
		/**
		 * @param {string} source
		 * @returns {?PronunciationSourceLastError}
		 */
		const le = source => this.sourceLastErrorTable.getValue(source);
		const now = new Date();
		const datetime = now.toISOString();
		const timestamp = now.getTime();
		/**
		 * @type {IpaSource[]}
		 */
		const sources = [
			is.ISCambridge,
			is.ISOxford,
			is.ISAntvaset,
			is.ISUnalengua,
		]
			 .map(S => new S(options.sources[S.name]))
			.filter(s => s.enabled(input, toText, le(s.name)))
			.sort((l, r) => l.order(toText) - r.order(toText));
		for (const s of sources) {
			console.log(`Searching IPA in ${s.name}`);
			try {
				const ipa = await s.fetch(input, analysis);
				if (ipa) {
					return { ipa, save: s.save };
				}
			} catch (error) {
				console.log({ error });
				if (s.saveError) {
					await this.saveError(`${s.name}: ${input}`, error);
				}
				if (error?.status && error.status !== 404) {
					/**
					 * @type {PronunciationSourceLastError}
					 */
					const lastError = {
						source: s.name,
						datetime,
						status: error.status,
						timestamp,
						message: error.message,
						messageContentType: error.messageContentType,
						error: removeMethods(error?.error ?? {}),
					};
					await this.sourceLastErrorTable.set(s.name, lastError);
					if (options.showSourceLastError) {
						await this.showInfo({
							info: `${lastError.source}: ${lastError.status}`,
							tabId,
							origin,
						});
					}
				}
			}
		}
		return {
			ipa: null,
			save: false,
		};
	}

	/**
	 * @param {{
	 *     word: string,
	 *     options: OptionsAudio,
	 *     analysis: WordAnalyse,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<HTMLAudioElement | null>}
	 */
	async fetchAudio({ word, options, analysis, tabId, origin }) {
		if (!options.enabled) {
			console.log("Play audio is disabled");
			return null;
		}
		/**
		  * @type {HTMLAudioElement | null}
		  */
		let audio = this.audioCache.get(word) ?? null;
		if (audio) {
			return audio;
		}
		/**
		 * @type {string | null}
		 */
		let base64 = await this.audioTable.getValue(word);
		if (!base64) {
			const { blob, save } = await this.fetchAudioExternally({
				input: word,
				options,
				analysis,
				toText: false,
				tabId,
				origin,
			});
			if (!blob) {
				return null;
			}
			const { error, value } = await goString(blob2base64(blob));
			base64 = value;
			if (error) {
				await this.saveError(`blob2base64: ${word}`, error);
				return null;
			}
			if (save) {
				console.log(`Adding ${word} to audio storage`);
				await this.audioTable.set(word, base64);
			}
		}
		audio = new Audio(base64);
		this.audioCache.set(word, audio);
		return audio;
	}

	/**
	 * @param {{
	 *     cacheKey: string,
	 *     input: string,
	 *     options: OptionsAudio,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<HTMLAudioElement | null>}
	 */
	async fetchAudioText({ cacheKey, input, options, tabId, origin}) {
		if (!options.text.enabled) {
			console.log("Play audio is disabled to text");
			return null;
		}
		/**
		 * @type {HTMLAudioElement | null}
		 */
		let audio = this.audioCache.get(cacheKey) ?? null;
		if (audio) {
			return audio;
		}
		/**
		 * @type {string | null}
		 */
		let base64 = await this.audioTextTable.getValue(cacheKey);
		if (!base64) {
			const { blob, save } = await this.fetchAudioExternally({
				input,
				options,
				analysis: {
					root: "",
					confidence: 1,
					type: "Text",
					isNoun: false,
					isVerb: false,
					isValid: true,
					isText: true,
				},
				toText: true,
				tabId,
				origin,
			});
			if (!blob) {
				return null;
			}
			const { error, value } = await goString(blob2base64(blob));
			base64 = value;
			if (error) {
				await this.saveError(`blob2base64: ${word}`, error);
				return null;
			}
			if (save && options.text.save) {
				let short = input;
				if (short.length > 15) {
					const begin = input.slice(0, 7);
					const end = input.slice(-5);
					short = `${begin}...${end}`;
				}
				console.log(`Adding [${short}] to audioText storage`);
				await this.audioTextTable.set(cacheKey, base64);
			}
		}
		audio = new Audio(base64);
		this.audioTextCache.set(cacheKey, audio);
		return audio;
	}

	/**
	 * @param {{
	 *     input: string,
	 *     options: OptionsAudio,
	 *     analysis: WordAnalyse,
	 *     toText: boolean,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<{ blob: Blob | null, save: boolean }>
	 */
	async fetchAudioExternally({
		input,
		options,
		analysis,
		toText,
		tabId,
		origin,
	}) {
		/**
		 * @param {string} source
		 * @returns {?PronunciationSourceLastError}
		 */
		const le = source => this.sourceLastErrorTable.getValue(source);
		const now = new Date();
		const datetime = now.toISOString();
		const timestamp = now.getTime();
		/**
		 * @type {AudioSource[]}
		 */
		const sources = [
			as.ASCambridge,
			as.ASLinguee,
			as.ASOxford,
			as.ASGstatic,
			as.ASGoogleSpeech,
			as.ASResponsiveVoice,
			as.ASUnrealSpeech,
			as.ASSpeechify,
			as.ASPlayHt,
			as.ASElevenLabs,
			as.ASAmazonPolly,
			as.ASOpenAi,
		]
			.map(S => new S(options.sources[S.name]))
			.filter(s => s.enabled(input, toText, le(s.name)))
			.sort((l, r) => l.order(toText) - r.order(toText));
		for (const s of sources) {
			console.log(`Searching audio in ${s.name}`);
			try {
				const blob = await s.fetch(input, analysis);
				if (blob) {
					return { blob, save: s.save };
				}
			} catch (error) {
				if (s.saveError) {
					await this.saveError(`${s.name}: ${input}`, error);
				}
				if (error?.status && error.status !== 404) {
					/**
					 * @type {PronunciationSourceLastError}
					 */
					const lastError = {
						source: s.name,
						datetime,
						status: error.status,
						timestamp,
						message: error.message,
						messageContentType: error.messageContentType,
						error: removeMethods(error?.error ?? {}),
					};
					await this.sourceLastErrorTable.set(s.name, lastError);
					if (options.showSourceLastError) {
						await this.showInfo({
							info: `${lastError.source}: ${lastError.status}`,
							tabId,
							origin,
						});
					}
				}
			}
		}
		return {
			blob: null,
			save: false,
		};
	}

	/**
	 * @returns {Promise<void>}
	 */
	async startup() {
		try {
			console.log("Startup begin");
			// allow new options settings without break change
			const mergedOptions = deepMerge(
				this.defaultOptions,
				await this.optionsTable.getAll(),
				true,
			);
			await this.optionsTable.setMany(mergedOptions);
			this.optionsCache.setMany(mergedOptions);
			await this.setMenuItem(this.optionsCache.get("accessKey"));
			console.log("Startup end");
		} catch (error) {
			await this.saveError("startup", error);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async initialSetup() {
		try {
			const menuId = "I";
			const message = "Wait init setup (~40s)";
			browser?.menus?.create({ id: menuId, title: message });
			const actionTitle = await browser.browserAction.getTitle({});
			const actionBadge = await browser.browserAction.getBadgeText({});
			await browser.browserAction.setTitle({ title: message });
			await browser.browserAction.setBadgeText({ text: message });
			console.log("Setup begin");
			console.log("Populating options");
			await this.populateOptions();
			console.log("Setting menuItem and action");
			console.log("Setup end");
			await browser?.menus?.remove(menuId);
			await browser.browserAction.setTitle({ title: actionTitle });
			await browser.browserAction.setBadgeText({ text: actionBadge });
			await this.startup();
		} catch (error) {
			await this.saveError("initialSetup", error);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async populateOptions() {
		/**
		 * @type {boolean | null | undefined}
		 */
		const populated = await this.controlTable.getValue(
			this.optionsTable.name,
		);
		if (!populated) {
			this.optionsTable.setMany(this.defaultOptions);
			await this.controlTable.set(this.optionsTable.name, true);
		}
	}

	/**
	 * @param {string} accessKey
	 * @returns {Promise<void>}
	 */
	async setMenuItem(accessKey) {
		const id = "P";
		const title = `&${accessKey} - Pronunciation`;
		try {
			await browser?.menus?.remove(id);
		} catch (error) {
			console.error(error);
		}
		browser?.menus?.create({ id, title });
	}

	/**
	 * @param {browser.menus.OnClickData} info
	 * @param {browser.tabs.Tab} tab
	 * @returns {Promise<void>}
	 */
	async menuOnClicked(info, tab) {
		try {
			const selectedText = (info.selectionText ?? "").trim();
	 		if (selectedText.length == 0) {
				console.log("Nothing was selected");
				return;
			}
			await this.pronounce(selectedText, tab.id, "menuItem");
		} catch (error) {
			await this.saveError("menuOnClicked", error);
		}
	}

	/**
	 * @param {browser.tabs.Tab} tab
	 * @returns {Promise<void>}
	 */
	async actionOnClicked(tab) {
		try {
			/**
			 * @type {BackgroundMessage}
			 */
			const message = { type: "getSelectedText", origin: "action" };
			/**
			 * @type {string | null}
			 */
			const selectedText = await browser.tabs.sendMessage(
				tab.id,
				message,
			);
			if (selectedText?.length == 0) {
				console.log("Nothing was selected");
				return;
			}
			await this.pronounce(selectedText, tab.id, "action");
		} catch (error) {
			await this.saveError("actionOnClicked", error);
		}
	}

	/**
	 * @param {{ [key: string]: browser.storage.StorageChange }} changes
	 * @param {string} areaName
	 * @returns {Promise<void>}
	 */
	async storageOnChanged(changes, areaName) {
		try {
			if (areaName !== "local") {
				return;
			}
			const changesKeys = Object.keys(changes);
			const ipaKeys = changesKeys.filter(
				k => k.startsWith(this.ipaTable.name),
			);
			const audioKeys = changesKeys.filter(
				k => k.startsWith(this.audioTable.name),
			);
			const optionsKeys = changesKeys.filter(
				k => k.startsWith(this.optionsTable.name),
			);
			if (ipaKeys.length > 0) {
				console.log(`Cleaning ${this.ipaCache.name} cache`);
				this.ipaCache.clear();
			}
			if (audioKeys.length > 0) {
				console.log(`Cleaning ${this.audioCache.name} cache`);
				this.audioCache.clear();
			}
			if (optionsKeys.length > 0) {
				console.log(`Cleaning ${this.optionsCache.name} cache`);
				this.optionsCache.clear();
				console.log(`Resetting ${this.optionsCache.name} cache`);
				this.optionsCache.setMany(await this.optionsTable.getAll());
				// only works if TableByParentKey
				const optionsChange = changes[optionsKeys];
				const oldAccessKey = optionsChange?.oldValue?.accessKey;
				const newAccessKey = optionsChange?.newValue?.accessKey;
				if (oldAccessKey !== newAccessKey) {
					await this.setMenuItem(newAccessKey);
				}
				const oldIpa = optionsChange?.oldValue?.ipa;
				const newIpa = optionsChange?.newValue?.ipa;
				if (!deepEquals(oldIpa, newIpa)) {
					console.log(`Cleaning ${this.ipaTextCache.name} cache`);
					this.ipaTextCache.clear();
				}
				const oldAudio = optionsChange?.oldValue?.audio;
				const newAudio = optionsChange?.newValue?.audio;
				if (!deepEquals(oldAudio, newAudio)) {
					console.log(`Cleaning ${this.audioTextCache.name} cache`);
					this.audioTextCache.clear();
				}
			}
		} catch (error) {
			await this.saveError("storageOnChanged", error);
		}
	}

	/**
	 * @param {browser.runtime._OnInstalledDetails} details
	 * @returns {Promise<void>}
	 */
	async onInstalled(details) {
		console.clear();
		if (details.temporary) {
			console.log("Cleaning storage due to temporary installation");
			await browser.storage.local.clear();
		}
		if (details.reason === "update") {
			const [major, minor, bug] = details
				.previousVersion
				.split(".")
				.map(parseInt);
			if (major < 3) { // break change
				await migrateToV3();
			}
			if (major === 3 && minor < 2) {
				await migrateToV3_2_0();
			}
		}
		await this.initialSetup();
		await browser.tabs.create({
			url: browser.runtime.getURL("src/options/pages/general.html"),
		});
	}

	/**
	 * @param {{
	 *     info: string,
	 *     closeTimeout: number,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 * @returns {Promise<void>}
	 */
	async showInfo({ info, closeTimeout=5000, tabId, origin }) {
		/**
		 * @type {BackgroundMessage}
		 */
		const message = {
			type: "showPopup",
			origin,
			showPopup: {
				text: info,
				position: {
					centerHorizontally: true,
					top: 100,
				},
				close: {
					timeout: closeTimeout,
				},
			},
		};
		await browser.tabs.sendMessage(tabId, message);
	}

	/**
	 * @param {string} context
	 * @param {any} error
	 * @returns {Promise<void>}
	 */
	async saveError(context, error) {
		console.error(error);
		const errorObj = removeMethods(error);
		if (error?.error) {
			errorObj['error'] = removeMethods(error.error);
		}
		this.errorsTable.set(new Date().toISOString(), {
			context,
			error: errorObj,
		});
	}
	
}
