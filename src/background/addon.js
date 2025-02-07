import "../utils/fflate.js";
import * as af from "../audio-from.js";
import * as pf from "../ipa-from.js";
import MemoryCache from "../utils/memory-cache.js";
import TableByKeyPrefix from "../utils/table-by-key-prefix.js";
import TableByParentKey from "../utils/table-by-parent-key.js";
import { splitWords } from "../utils/string.js";

export default class Addon {

	/**
	 * @param {browser.storage.StorageArea} storage
	 */
	constructor(storage) {
		this.storage = storage;
		this.audioTable = new TableByKeyPrefix(storage, "a");
		this.audioCache = new MemoryCache();
		this.ipaTable = new TableByKeyPrefix(storage, "i");
		this.ipaCache = new MemoryCache("ipaCache");
		this.defaultIpaTable = new TableByParentKey(storage, "defaultIpa");
		this.optionsTable = new TableByParentKey(storage, "options");
		this.optionsCache = new MemoryCache("optionsCache");
		this.defaultOptionsTable = new TableByParentKey(
			storage,
			"defaultOptions",
		);
		this.controlTable = new TableByParentKey(storage, "control");
		this.errorsTable = new TableByParentKey(storage, "errors");
	}

	/**
	 * @param {string} text
	 * @returns {Promise<void>}
	 */
	async pronounce(text) {
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
		if (words.length === 1 || options.ignoreMultipleWords) {
			const word = words[0];
			const ipa = await pf.ipaFromTable(word, this.ipaTable);
			console.log({ word, ipa });
		} else if (!options.ignoreMultipleWords) {
			console.log("multiple words", words);
		}
	}

	/**
	 * @param {string} initialIpaFile
	 * @returns {Promise<void>}
	 */
	async initialSetup(initialIpaFile) {
		try {
			console.log("setup begin");
			const throwNotFound = false;
			console.log("populating options and ipa");
			await Promise.all([
				this.populateOptions(),
				this.populateInitialIpa(initialIpaFile),
			]);
			const alreadySet = await this.controlTable.get(
				["setMenuItem", "setAction"],
				throwNotFound,
			);
			console.log("setting menuItem and action");
			await Promise.all([
				this.setMenuItem(
					alreadySet?.setMenuItem ?? false,
					this.optionsCache.get("accessKey", throwNotFound),
				),
				this.setAction(alreadySet?.setAction ?? false),
			]);
			console.log("setup end");
		} catch (error) {
			await this.saveError("setup", error);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async populateOptions() {
		const throwNotFound = false;
		/**
		 * @type {boolean | null | undefined}
		 */
		const populated = await this.controlTable.getValue(
			this.optionsTable.parentKey,
			throwNotFound,
		);
		if (populated) {
			console.log("options table is already populated");
			this.optionsCache.setMany(await this.optionsTable.getAll());
		} else {
			const defaultOptions = {
				// accessKey: "P",
				accessKey: "Y",
				oldAccessKey: null, // used in setMenuItem()
				ignoreMultipleWords: false,
				ipa: {
					enabled: true,
					closeTimeout: 3000,
					fontFamily: "'Lucida Sans Unicode', 'Segoe UI'",
					fontSizePx: 18,
					closeShortcut: "\\",
					closeOnScroll: true,
					useContextColors: false,
					positionMenuTriggered: "above",
					positionActionTriggered: "below",
				},
				audio: {
					enabled: true,
					volume: 1.0,
					playbackRate: 1.0,
					fetchFileTimeout: 1250,
					fetchScrapTimeout: 1250,
				},
				setPronuncationByShortcut: {
					audioShortcut: "A",
					ipaShortcut: "Z",
					restoreDefaultIpaShortcut: "X",
				},
			};
			await Promise.all([
				this.optionsTable.setMany(defaultOptions),
				this.defaultOptionsTable.setMany(defaultOptions),
			]);
			this.optionsCache.setMany(defaultOptions);
			await this.controlTable.set(this.optionsTable.parentKey, true);
		}
	}

	/**
	 * @param {string} initialIpaFile
	 * @returns {Promise<void>}
	 */
	async populateInitialIpa(initialIpaFile) {
		const throwNotFound = false;
		/**
		 * @type {boolean | null | undefined}
		 */
		const populated = await this.controlTable.getValue(
			this.ipaTable.keyPrefix,
			throwNotFound,
		);
		if (populated) {
			console.log("ipa table is already populated");
		} else {
			const url = browser.runtime.getURL(initialIpaFile);
			const response = await fetch(url);
			const gzipBuffer = new Uint8Array(await response.arrayBuffer());
			const ipaBuffer = fflate.decompressSync(gzipBuffer);
			const values = JSON.parse(new TextDecoder().decode(ipaBuffer));
			await Promise.all([
				this.ipaTable.setMany(values),
				this.defaultIpaTable.setMany(values),
			]);
			await this.controlTable.set(this.ipaTable.keyPrefix, true);
		}
	}

	/**
	 * @param {boolean} alreadySet
	 * @param {string} accessKey
	 * @returns {Promise<void>}
	 */
	async setMenuItem(alreadySet, accessKey) {
		/**
		 * @type {boolean | null | undefined}
		 */
		const id = "P";
		const title = `&${accessKey} - Test Pronunciation`;
		if (alreadySet) {
			const throwNotFound = false;
			/**
			 * @type {string | null}
			 */
			const oldAccessKey = this.optionsCache.get(
				"oldAccessKey",
				throwNotFound,
			);
			if (accessKey !== oldAccessKey) {
				await browser.menus.update(id, { title });
				this.optionsCache.set("oldAccessKey", accessKey);
			}
		} else {
			browser.menus.onClicked.addListener(async (info, tab) => {
				return this.menuOnClicked(info, tab);
			});
			browser.menus.create({ id, title });
			await this.controlTable.set("setMenuItem", true);
		}
	}

	/**
	 * @param {boolean} alreadySet
	 * @returns {Promise<void>}
	 */
	async setAction(alreadySet) {
		if (!alreadySet) {
			browser.browserAction.onClicked.addListener(async (tab) => {
				this.actionOnClicked(tab);
			});
			await this.controlTable.set("setAction", true);
		}
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
			return this.pronounce(selectedText);
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
			const selectedText = "Speaking of data: They want that, too.";
			if (selectedText?.length == 0) {
				console.log("nothing was selected");
				return;
			}
			return this.pronounce(selectedText);
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
			if (areaName != 'local') {
				return;
			}
			console.log("todo storageOnChanged");
		} catch (error) {
			await this.saveError("storageOnChanged", error);
		}
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
			error,
		});
	}

}
