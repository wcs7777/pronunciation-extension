import * as as from "../pronunciation/audio-source/sources.js";
import * as is from "../pronunciation/ipa-source/sources.js";
import Pronunciation from "../pronunciation/pronunciation.js";
import PronunciationInput from "../pronunciation/pronunciation-input.js";
import { deepEquals, deepMerge, removeMethods } from "../utils/object.js";
import { migrateToV3, migrateToV3_2_0 } from "./migrations.js";

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
		/**
		 * @type{IpaSource[]}
		 */
		this.ipaSources = [
			is.ISAntvaset,
			is.ISCambridge,
			is.ISOxford,
			is.ISUnalengua,
		];
		/**
		 * @type{AudioSource[]}
		 */
		this.audioSources = [
			as.ASAmazonPolly,
			as.ASCambridge,
			as.ASDeepSeek,
			as.ASElevenLabs,
			as.ASGoogleSpeech,
			as.ASGstatic,
			as.ASLinguee,
			as.ASOpenAi,
			as.ASOxford,
			as.ASPlayHt,
			as.ASResponsiveVoice,
			as.ASSpeechify,
			as.ASUnrealSpeech,
		];
	}

	/**
	 * @param {string} input
	 * @param {number} tabId
	 * @param {"menuItem" | "action" | "other"} origin
	 * @returns {Promise<void>}
	 */
	async pronounce(input, tabId, origin) {
		const options = await this.getOptions();
		const pi = new PronunciationInput(input, options.allowText);
		const pronunciation = new Pronunciation({
			pi,
			ipaSources: this.ipaSources,
			audioSources: this.audioSources,
			options,
			audioTable: this.audioTable,
			audioCache: this.audioCache,
			ipaTable: this.ipaTable,
			ipaCache: this.ipaCache,
			audioTextTable: this.audioTextTable,
			audioTextCache: this.audioTextCache,
			ipaTextCache: this.ipaTextCache,
			sourceLastErrorTable: this.sourceLastErrorTable,
			tabId,
			origin,
		});
		try {
			await pronunciation.pronounce();
		} catch (error) {
			this.saveError("pronunciation", error);
		}
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
			const actionTitle = await browser.action.getTitle({});
			const actionBadge = await browser.action.getBadgeText({});
			await browser.action.setTitle({ title: message });
			await browser.action.setBadgeText({ text: message });
			console.log("Setup begin");
			console.log("Populating options");
			await this.populateOptions();
			console.log("Setting menuItem and action");
			console.log("Setup end");
			await browser?.menus?.remove(menuId);
			await browser.action.setTitle({ title: actionTitle });
			await browser.action.setBadgeText({ text: actionBadge });
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
		browser?.menus?.create({
			id,
			title,
			contexts: ["selection"],
			enabled: true,
			type: "normal",
			visible: true,
		});
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
			 * @type {ClientMessage}
			 */
			const message = {
				target: "client",
				type: "getSelectedText",
				origin: "action",
			};
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
	 * @returns {Promise<Options>}
	 */
	async getOptions() {
		/**
		 * @type {Options}
		 */
		let opt = this.optionsCache.getAll();
		if (!opt.ipa || !opt.audio) {
			opt = await this.optionsTable.getAll();
			this.optionsCache.setMany(opt);
		}
		return opt;
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
		 * @type {ClientMessage}
		 */
		const message = {
			target: "client",
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
