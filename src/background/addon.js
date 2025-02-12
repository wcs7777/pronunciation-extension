import "../utils/fflate.js";
import * as af from "../utils/audio-from.js";
import * as pf from "../utils/ipa-from.js";
import { blob2base64 } from "../utils/element.js";
import { generateSha1, splitWords } from "../utils/string.js";
import { goBlob, goString, resolveTimeout } from "../utils/promise.js";
import { threshold } from "../utils/number.js";

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
		audioTextCache,
		ipaTextCache,
	}) {
		/**
		 * @type {string}
		 */
		this.initialIpaFile = initialIpaFile;
		/**
		 * @type {Options}
		 */
		this.defaultOptions = defaultOptions;
		/**
		 * @type {Table}
		 */
		this.audioTable = audioTable;
		/**
		 * @type {MemoryCache}
		 */
		this.audioCache = audioCache;
		/**
		 * @type {Table}
		 */
		this.ipaTable = ipaTable;
		/**
		 * @type {MemoryCache}
		 */
		this.ipaCache = ipaCache;
		/**
		 * @type {Table}
		 */
		this.defaultIpaTable = defaultIpaTable;
		/**
		 * @type {Table}
		 */
		this.optionsTable = optionsTable;
		/**
		 * @type {MemoryCache}
		 */
		this.optionsCache = optionsCache;
		/**
		 * @type {Table}
		 */
		this.defaultOptionsTable = defaultOptionsTable;
		/**
		 * @type {Table}
		 */
		this.controlTable = controlTable;
		/**
		 * @type {Table}
		 */
		this.errorsTable = errorsTable;
		/**
		 * @type {MemoryCache}
		 */
		this.audioTextCache = audioTextCache;
		/**
		 * @type {MemoryCache}
		 */
		this.ipaTextCache = ipaTextCache;
	}

	/**
	 * @param {string} text
	 * @param {number} tabId
	 * @param {"menuItem" | "action" | "other"} origin
	 * @returns {Promise<void>}
	 */
	async pronounce(text, tabId, origin) {
		/**
		  * @type {Options}
		  */
		const options = this.optionsCache.getAll();
		const words = splitWords(text.toLowerCase());
		console.log({ text, words });
		if (words.length === 0) {
			console.log("no word was found in text");
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
		if (words.length === 1 || !options.allowMultipleWords) {
			const word = words[0];
			const maxCharacters = 45; // biggest english word
			if (word.length <= maxCharacters) {
				ipaPromise = this.findIpa(word, options.ipa);
				audioPromise = this.findAudio(word, options.audio);
			} else {
				const message = (
					`Exceeded ${maxCharacters} characters allowed for words`
				);
				console.error(message);
				ipaPromise = resolveTimeout(0, message);
			}
		} else if (options.allowMultipleWords) {
			const maxCharacters = 1500; // api limitation
			options.ipa.close.timeout = threshold(
				options.ipa.close.timeout,
				Math.max(300000, options.ipa.close.timeout),
				options.ipa.close.timeout / 2 * words.length,
			);
			options.ipa.close.onScroll = false;
			if (text.length <= maxCharacters) {
				const key = await generateSha1(text);
				ipaPromise = this.findTextIpa(key, text, options.ipa);
				audioPromise = this.findTextAudio(key, text, options.audio);
			} else {
				const message = (
					`Exceeded ${maxCharacters} characters allowed for texts`
				);
				console.error(message);
				ipaPromise = resolveTimeout(0, message);
			}
		}
		await Promise.all([
			this.showIpa(ipaPromise, options.ipa, tabId, origin),
			this.playAudio(audioPromise, options.audio),
		]);
		console.log("pronunciation end");
	}

	/**
	 * @param {Promise<string | null> | null} ipaPromise
	 * @param {OptionsIpa} options
	 * @param {number} tabId
	 * @param {"menuItem" | "action" | "other"} origin
	 * @returns {Promise<void>}
	 */
	async showIpa(ipaPromise, options, tabId, origin) {
		try {
			const ipa = ipaPromise !== null ? await ipaPromise : null;
			if (!ipa) {
				if (options.enabled) {
					console.log("no ipa was found");
				}
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
	 * @param {Promise<HTMLAudioElement | null> | null} audioPromise
	 * @param {OptionsAudio} options
	 * @returns {Promise<void>}
	 */
	async playAudio(audioPromise, options) {
		try {
			const audio = audioPromise !== null ? await audioPromise : null;
			if (!audio) {
				if (options.enabled) {
					console.log("no audio was found");
				}
				return;
			}
			audio.volume = threshold(0, 1, options.volume);
			audio.playbackRate = threshold(0.2, 2.0, options.playbackRate);
			await audio.play();
		} catch (error) {
			await this.saveError("playAudio", error);
		}
	}

	/**
	 * @param {string} word
	 * @param {OptionsIpa} options
	 * @returns {Promise<string | null>}
	 */
	async findIpa(word, options) {
		if (!options.enabled) {
			console.log("show ipa is disabled");
			return null;
		}
		/**
		  * @type {string | null}
		  */
		let ipa = this.ipaTextCache.get(word, false) ?? null;
		if (!ipa) {
			let r = await goString(this.ipaTable.getValue(word));
			if (r.error) {
				const { r: rExternal, save } = await this.findIpaExternally(
					word,
					options,
				);
				r = rExternal;
				if (r.value && save) {
					console.log(`adding ${word} to ipa storage`);
					await this.ipaTable.set(word, r.value);
				}
			}
			if (r.value) {
				this.ipaCache.set(word, r.value);
			}
			ipa = r.value;
		}
		return ipa;
	}

	/**
	 * @param {string} word
	 * @param {OptionsIpa} options
	 * @returns {Promise<{
	 *     r: { error: Error | null, value: string | null },
	 *     save: boolean,
	 * }>
	 */
	async findIpaExternally(word, options) {
		let save = true;
		let r = await goString(pf.ipaFromUnalengua(word));
		if (r.error) {
			await this.saveError(`Unalengua: ${word}`, r.error);
			r = await goString(pf.ipaFromCambridge(word));
			if (r.error) {
				await this.saveError(`Cambridge: ${word}`, r.error);
				r = await goString(pf.ipaFromOxford(word));
				if (r.error) {
					await this.saveError(`Oxford: ${word}`, r.error);
				}
			}
		}
		return { r, save };
	}

	/**
	 * @param {string} word
	 * @param {OptionsAudio} options
	 * @returns {Promise<HTMLAudioElement | null>}
	 */
	async findAudio(word, options) {
		if (!options.enabled) {
			console.log("play audio is disabled");
			return null;
		}
		/**
		  * @type {HTMLAudioElement | null}
		  */
		let audio = this.audioCache.get(word, false) ?? null;
		if (!audio) {
			/**
			  * @type {string}
			  */
			let base64 = null;
			const { error, value } = await goString(
				this.audioTable.getValue(word),
			);
			base64 = value;
			if (error) {
				const { r, save } = await this.findAudioExternally(
					word,
					options,
				);
				if (r.value) {
					try {
						base64 = await blob2base64(r.value);
						if (save) {
							console.log(`adding ${word} to audio storage`);
							await this.audioTable.set(word, base64);
						}
					} catch (error) {
						await this.saveError(`blob2base64: ${word}`, error);
					}
				}
			}
			if (base64) {
				audio = new Audio(base64);
				this.audioCache.set(word, audio);
			}
		}
		return audio;
	}

	/**
	 * @param {string} word
	 * @param {OptionsAudio} options
	 * @returns {Promise<{
	 *     r: { error: Error | null, value: Blob | null },
	 *     save: boolean,
	 * }>
	 */
	async findAudioExternally(word, options) {
		let save = true;
		let r = await goBlob(
			Promise.any([
				af.audioFromOxford(word),
				af.audioFromGstatic(word),
				resolveTimeout(options.fetchFileTimeout, null),
			]),
		);
		if (!r.value) {
			r = await goBlob(
				af.audioFromResponsiveVoice(word, options.responseVoice),
			);
			if (r.error) {
				await this.saveError(`ResponsiveVoice: ${word}`, r.error);
				r = await goBlob(af.audioFromGoogleSpeech(word));
				save = options.saveGoogleSpeechAudio;
				if (r.error) {
					await this.saveError(`GoogleSpeech: ${word}`, r.error);
				}
			}
		}
		return { r, save };
	}

	/**
	 * @param {string} cacheKey
	 * @param {string} text
	 * @param {OptionsIpa} options
	 * @returns {Promise<string | null>}
	 */
	async findTextIpa(cacheKey, text, options) {
		if (!options.enabled) {
			console.log("show ipa is disabled");
			return null;
		}
		/**
		 * @type {string}
		 */
		let ipa = null;
		if (!this.ipaTextCache.hasKey(cacheKey)) {
			try {
				ipa = await pf.ipaFromUnalengua(text);
				this.ipaTextCache.set(cacheKey, ipa);
			} catch (error) {
				await this.saveError("Unalengua: text", error);
			}
		} else {
			ipa = this.ipaTextCache.get(cacheKey);
		}
		return ipa;
	}

	/**
	 * @param {string} cacheKey
	 * @param {string} text
	 * @param {OptionsAudio} options
	 * @returns {Promise<HTMLAudioElement | null>}
	 */
	async findTextAudio(cacheKey, text, options) {
		if (!options.enabled) {
			console.log("play audio is disabled");
			return null;
		}
		/**
		 * @type {HTMLAudioElement}
		 */
		let audio = null;
		if (!this.audioTextCache.hasKey(cacheKey)) {
			try {
				const blob = await af.audioFromResponsiveVoice(
					text,
					options.responseVoice,
				);
				const base64 = await blob2base64(blob);
				audio = new Audio(base64);
				this.audioTextCache.set(cacheKey, audio);
			} catch (error) {
				await this.saveError("ResponsiveVoice: text", error);
			}
		} else {
			audio = this.audioTextCache.get(cacheKey);
		}
		return audio;
	}

	/**
	 * @returns {Promise<void>}
	 */
	async startup() {
		try {
			// allow new options settings without break change
			await this.optionsTable.setMany({
				...this.defaultOptions,
				...(await this.optionsTable.getAll()),
			});
			this.optionsCache.setMany(await this.optionsTable.getAll());
			await this.setMenuItem(this.optionsCache.get("accessKey"));
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
			console.log("setup begin");
			console.log("populating options and ipa");
			console.time("populate");
			await Promise.all([
				this.populateOptions(),
				this.populateInitialIpa(),
			]);
			console.timeEnd("populate");
			console.log("setting menuItem and action");
			console.log("setup end");
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
			console.log("ipa table is already populated");
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
				console.log("nothing was selected");
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
				console.log("nothing was selected");
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
				console.log(`cleaning ${this.ipaCache.name} cache`);
				this.ipaCache.clear();
			}
			if (audioKeys.length > 0) {
				console.log(`cleaning ${this.audioCache.name} cache`);
				this.audioCache.clear();
			}
			if (optionsKeys.length > 0) {
				console.log(`cleaning ${this.optionsCache.name} cache`);
				this.optionsCache.clear();
				console.log(`resetting ${this.optionsCache.name} cache`);
				this.optionsCache.setMany(await this.optionsTable.getAll());
				// only works if TableByParentKey
				const optionsChange = changes[optionsKeys];
				const oldAccessKey = optionsChange?.oldValue?.accessKey;
				const newAccessKey = optionsChange?.newValue?.accessKey;
				if (oldAccessKey !== newAccessKey) {
					await this.setMenuItem(newAccessKey);
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
				console.log("cleaning storage due to update break change");
				await browser.storage.local.clear();
			}
		}
		if (details.temporary) {
			console.log("cleaning storage due to temporary installation");
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
		this.errorsTable.set(new Date().toISOString(), {
			context,
			error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
		});
	}

}
