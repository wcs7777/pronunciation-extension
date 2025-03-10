import "../utils/fflate.js";
import * as af from "../audio-fetcher/fetchers.js";
import * as pf from "../ipa-fetcher/fetchers.js";
import { blob2base64 } from "../utils/element.js";
import { deepEquals, deepMerge, removeMethods } from "../utils/object.js";
import { goString } from "../utils/promise.js";
import { threshold } from "../utils/number.js";
import {
	generateSha1,
	removeExtraSpaces,
	splitWords,
} from "../utils/string.js";

export default class Addon {

	/**
	 * @param {{
	 *     initialIpaFile: string,
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
	 *     audioTextTable: Table,
	 *     audioTextCache: MemoryCache,
	 *     ipaTextCache: MemoryCache,
	 * }}
	 */
	constructor({
		initialIpaFile,
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
		audioTextTable,
		audioTextCache,
		ipaTextCache,
	}) {
		this.initialIpaFile = initialIpaFile;
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
				ipaPromise = this.fetchIpa(word, options.ipa);
				audioPromise = this.fetchAudio(word, options.audio);
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
			console.log({ textKey: key });
			isText = true;
			sourceAudioId = key;
			sourceAudioTitle = text;
			if (sourceAudioTitle.length > 80) {
				const begin = text.slice(0, 60);
				const end = text.slice(-17);
				sourceAudioTitle = `${begin}...${end}`;
			}
			ipaPromise = this.fetchIpaText(
				key,
				text,
				options.ipa,
				words.length,
			);
			audioPromise = this.fetchAudioText(key, text, options.audio);
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
					!options.playerEnabledToText &&
					!options.shortcutsEnabledToText
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
						playerEnabled: options.playerEnabledToText,
						shortcutsEnabled: options.shortcutsEnabledToText,
						shortcuts: options.shortcuts,
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
				await audio.play();
			}
		} catch (error) {
			await this.saveError("playAudio", error);
		}
	}

	/**
	 * @param {string} word
	 * @param {OptionsIpa} options
	 * @returns {Promise<string | null>}
	 */
	async fetchIpa(word, options) {
		if (!options.enabled) {
			console.log("Show IPA is disabled");
			return null;
		}
		/**
		  * @type {string | null}
		  */
		let ipa = this.ipaTextCache.get(word, false) ?? null;
		if (ipa) {
			return ipa;
		}
		const { value } = await goString(this.ipaTable.getValue(word));
		ipa = value;
		if (!ipa) {
			const { ipa: ipaValue, save } = await this.fetchIpaExternally(
				word,
				options,
				false,
			);
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
	 * @param {string} cacheKey
	 * @param {string} input
	 * @param {OptionsIpa} options
	 * @param {number} totalWords
	 * @returns {Promise<string | null>}
	 */
	async fetchIpaText(cacheKey, input, options, totalWords) {
		if (!options.enabledToText) {
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
			const { ipa } = await this.fetchIpaExternally(
				input,
				options,
				true,
			);
			if (!ipa) {
				return null;
			}
			this.ipaTextCache.set(cacheKey, ipa);
		}
		return this.ipaTextCache.get(cacheKey);
	}

	/**
	 * @param {string} input
	 * @param {OptionsIpa} options
	 * @param {boolean} toText
	 * @returns {Promise<{ ipa: string | null, save: boolean }>
	 */
	async fetchIpaExternally(input, options, toText) {
		const timestamp = new Date().getTime();
		const leKey = "ipaLastError";
		/**
		 * @type{{ [key: string]: PronunciationFetcherLastError}
		 */
		const le = await this.controlTable.getValue(leKey, false) ?? {};
		/**
		 * @type {IpaFetcher[]}
		 */
		const unordedFetchers = [
			new pf.IFAntvaset(options.antvaset, le?.[pf.IFAntvaset.name]),
			new pf.IFUnalengua(options.unalengua, le?.[pf.IFUnalengua.name]),
			new pf.IFCambridge(options.cambridge, le?.[pf.IFCambridge.name]),
			new pf.IFOxford(options.oxford, le?.[pf.IFOxford.name]),
		];
		const fetchers = unordedFetchers
			.filter(f => f.enabled(input, toText))
			.sort((l, r) => l.order(toText) - r.order(toText));
		for (const f of fetchers) {
			console.log(`Searching IPA in ${f.name}`);
			try {
				const ipa = await f.fetch(input);
				if (ipa) {
					return { ipa, save: f.save };
				}
			} catch (error) {
				console.log({ error });
				if (f.saveError) {
					await this.saveError(`${f.name}: ${input}`, error);
				}
				if (error?.status) {
					le[f.name] = {
						...error,
						error: removeMethods(error?.error ?? {}),
						timestamp,
					};
					await this.controlTable.set(leKey, le);
				}
			}
		}
		return {
			ipa: null,
			save: false,
		};
	}

	/**
	 * @param {string} word
	 * @param {OptionsAudio} options
	 * @returns {Promise<HTMLAudioElement | null>}
	 */
	async fetchAudio(word, options) {
		if (!options.enabled) {
			console.log("Play audio is disabled");
			return null;
		}
		/**
		  * @type {HTMLAudioElement | null}
		  */
		let audio = this.audioCache.get(word, false) ?? null;
		if (audio) {
			return audio;
		}
		const { value } = await goString(
			this.audioTable.getValue(word),
		);
		/**
		 * @type {string | null}
		 */
		let base64 = value;
		if (!value) {
			const { blob, save } = await this.fetchAudioExternally(
				word,
				options,
				false,
			);
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
	 * @param {string} cacheKey
	 * @param {string} input
	 * @param {OptionsAudio} options
	 * @returns {Promise<HTMLAudioElement | null>}
	 */
	async fetchAudioText(cacheKey, input, options) {
		if (!options.enabledToText) {
			console.log("Play audio is disabled to text");
			return null;
		}
		/**
		 * @type {HTMLAudioElement | null}
		 */
		let audio = this.audioCache.get(cacheKey, false) ?? null;
		if (audio) {
			return audio;
		}
		const { value } = await goString(
			this.audioTextTable.getValue(cacheKey),
		);
		/**
		 * @type {string | null}
		 */
		let base64 = value;
		if (!value) {
			const { blob, save } = await this.fetchAudioExternally(
				input,
				options,
				true,
			);
			if (!blob) {
				return null;
			}
			const { error, value } = await goString(blob2base64(blob));
			base64 = value;
			if (error) {
				await this.saveError(`blob2base64: ${word}`, error);
				return null;
			}
			if (save && options.saveTextAudio) {
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
	 * @param {string} input
	 * @param {OptionsAudio} options
	 * @param {boolean} toText
	 * @returns {Promise<{ blob: Blob | null, save: boolean }>
	 */
	async fetchAudioExternally(input, options, toText) {
		const timestamp = new Date().getTime();
		const leKey = "audioLastError";
		/**
		 * @type{{ [key: string]: PronunciationFetcherLastError}
		 */
		const le = await this.controlTable.getValue(leKey, false) ?? {};
		/**
		 * @type {AudioFetcher[]}
		 */
		const unordedFetchers = [
			new af.AFRealVoice(
				options.realVoice,
				le?.[af.AFRealVoice.name],
			),
			new af.AFGoogleSpeech(
				options.googleSpeech,
				le?.[af.AFGoogleSpeech.name],
			),
			new af.AFResponsiveVoice(
				options.responsiveVoice,
				le?.[af.AFResponsiveVoice.name],
			),
			new af.AFUnrealSpeech(
				options.unrealSpeech,
				le?.[af.AFUnrealSpeech.name],
			),
			new af.AFSpeechify(
				options.speechify,
				le?.[af.AFSpeechify.name],
			),
			new af.AFPlayHt(
				options.playHt,
				le?.[af.AFPlayHt.name],
			),
			new af.AFElevenLabs(
				options.elevenLabs,
				le?.[af.AFElevenLabs.name],
			),
			new af.AFAmazonPolly(
				options.amazonPolly,
				le?.[af.AFAmazonPolly.name],
			),
			new af.AFOpenAi(
				options.openAi,
				le?.[af.AFOpenAi.name],
			),
		];
		const fetchers = unordedFetchers
			.filter(f => f.enabled(input, toText))
			.sort((l, r) => l.order(toText) - r.order(toText));
		for (const f of fetchers) {
			console.log(`Searching audio in ${f.name}`);
			try {
				const blob = await f.fetch(input);
				if (blob) {
					return { blob, save: f.save };
				}
			} catch (error) {
				if (f.saveError) {
					await this.saveError(`${f.name}: ${input}`, error);
				}
				if (error?.status) {
					le[f.name] = {
						...error,
						error: removeMethods(error?.error ?? {}),
						timestamp,
					};
					await this.controlTable.set(leKey, le);
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
			console.log("Populating options and ipa");
			console.time("populate");
			await Promise.all([
				this.populateOptions(),
				this.populateInitialIpa(),
			]);
			console.timeEnd("populate");
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
			false,
		);
		if (!populated) {
			this.optionsTable.setMany(this.defaultOptions);
			await this.controlTable.set(this.optionsTable.name, true);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async populateInitialIpa() {
		/**
		 * @type {boolean | null | undefined}
		 */
		const populated = await this.controlTable.getValue(
			this.ipaTable.name,
			false,
		);
		if (populated) {
			console.log("IPA table is already populated");
		} else {
			const url = browser.runtime.getURL(this.initialIpaFile);
			const response = await fetch(url);
			const gzipBuffer = new Uint8Array(await response.arrayBuffer());
			const ipaBuffer = fflate.decompressSync(gzipBuffer);
			const values = JSON.parse(new TextDecoder().decode(ipaBuffer));
			await Promise.all([
				this.ipaTable.setMany(values),
				this.defaultIpaTable.setMany(values),
			]);
			await this.controlTable.set(this.ipaTable.name, true);
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
		if (details.reason === "update") {
			if (parseInt(details.previousVersion) < 1) { // break change
				console.log("Cleaning storage due to update break change");
				await browser.storage.local.clear();
			}
		}
		if (details.temporary) {
			console.log("Cleaning storage due to temporary installation");
			await browser.storage.local.clear();
		}
		await this.initialSetup();
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
