import { blob2base64 } from "../utils/element.js";
import { sleep } from "../utils/promise.js";

export default class Pronunciation {

	/**
	 * @param {{
	 *     pi: PronunciationInput,
	 *     position: PronunciationInput,
	 *     options: Options,
	 *     audioTable: Table,
	 *     audioCache: MemoryCache,
	 *     ipaTable: Table,
	 *     ipaCache: MemoryCache,
	 *     audioTextTable: Table,
	 *     audioTextCache: MemoryCache,
	 *     ipaTextCache: MemoryCache,
	 *     sourceLastErrorTable: Table,
	 *     tabId: number,
	 *     origin: "menuItem" | "action" | "other",
	 * }}
	 */
	constructor({
		pi,
		position,
		options,
		audioTable,
		audioCache,
		ipaTable,
		ipaCache,
		audioTextTable,
		audioTextCache,
		ipaTextCache,
		sourceLastErrorTable,
		tabId,
		origin,
	}) {
		this.pi = pi;
		this.position = position;
		this.options = options;
		this.audioTable = audioTable;
		this.audioCache = audioCache;
		this.ipaTable = ipaTable;
		this.ipaCache = ipaCache;
		this.audioTextTable = audioTextTable;
		this.audioTextCache = audioTextCache;
		this.ipaTextCache = ipaTextCache;
		this.sourceLastErrorTable = sourceLastErrorTable;
		this.tabId = tabId;
		this.origin = origin;
	}

	/**
	 * @returns {Promise<void>}
	 */
	async pronounce() {
		console.log({ raw: this.pi.raw });
		if (!this.pi.hasWords) {
			console.log("No word was found in input");
			return;
		}
		console.log({
			input: this.pi.input,
			length: this.pi.length,
			tabId: this.tabId,
			origin: this.origin,
		});
		if (!this.pi.isText) {
			const maxCharacters = 60;
			if (this.pi.length > maxCharacters) {
				await this.showInfo(
					`The limit of ${maxCharacters} characters was exceeded`
				);
				return;
			}
			await Promise.all([
				this.playAudioInBackground(
					this.fetchAudio(this.options.audio),
					this.options.audio,
				),
				this.showIpa(
					this.fetchIpa(this.options.ipa),
					this.options.ipa,
				),
			]);
		} else {
			const key = await this.pi.key();
			console.log({ textKey: key });
			let audioTitle = this.pi.text;
			if (audioTitle.length > 80) {
				const begin = this.pi.text.slice(0, 60);
				const end = this.pi.text.slice(-17);
				audioTitle = `${begin}...${end}`;
			}
			await Promise.all([
				this.playAudioInClient(
					this.fetchAudioText(this.options.audio),
					this.options.audio,
					key,
					audioTitle,
				),
				this.showIpa(
					this.fetchIpaText(this.options.ipa),
					this.options.ipa,
				),
			]);
		}
	}

	/**
	 * @param {Promise<string | null>} ipaPromise
	 * @param {OptionsIpa} options
	 * @returns {Promise<void>}
	 */
	async showIpa(ipaPromise, options) {
		const ipa = await ipaPromise;
		if (!ipa) {
			console.log("No IPA was found or show IPA is disabled");
			return;
		}
		console.log({ ipa, tabId: this.tabId });
		/** @type {ClientMessage} */
		const message = {
			target: "client",
			type: "showIpa",
			origin: this.origin,
			showIpa: {
				ipa,
				position: this.position,
				options
			},
		};
		await this.sendMessage(message);
	}

	/**
	 * @param {Promise<string | null>} audioPromise
	 * @param {OptionsAudio} options
	 * @returns {Promise<void>}
	 */
	async playAudioInBackground(audioPromise, options) {
		const url = await audioPromise;
		if (!url) {
			console.log("No audio was found or play audio is disabled");
			return;
		}
		const tab = await chrome.tabs.get(this.tabId);
		if (tab?.mutedInfo?.muted) {
			console.log(`Tab ${this.tabId} is muted`);
			return;
		}
		/** @type {OffscreenMessage} */
		const message = {
			target: "offscreen",
			type: "playAudio",
			origin: this.origin,
			playAudio: {
				url,
				options,
			},
		};
		await chrome.runtime.sendMessage(message);
	}

	/**
	 * @param {Promise<string>} audioPromise
	 * @param {OptionsAudio} options
	 * @param {string} audioId
	 * @param {string} audioTitle
	 * @returns {Promise<void>}
	 */
	async playAudioInClient(audioPromise, options, audioId, audioTitle) {
		const url = await audioPromise;
		if (!url) {
			console.log("No audio was found or play audio is disabled");
			return;
		}
		const tab = await chrome.tabs.get(this.tabId);
		if (tab?.mutedInfo?.muted) {
			console.log(`Tab ${this.tabId} is muted`);
			return;
		}
		let playInBackground = !(
			options.text.playerEnabled ||
			options.text.shortcutsEnabled
		);
		if (!playInBackground) {
			/** @type {ClientMessage} */
			const message = {
				target: "client",
				type: "playAudio",
				origin: this.origin,
				playAudio: {
					source: {
						id: audioId,
						title: audioTitle,
						url: url,
					},
					limitLoudness: options.text.limitLoudness,
					playerEnabled: options.text.playerEnabled,
					shortcutsEnabled: options.text.shortcutsEnabled,
					skipSeconds: options.text.skipSeconds,
					shortcuts: options.text.shortcuts,
				},
			};
			try {
				await this.sendMessage(message);
			} catch (error) {
				console.error(error);
				playInBackground = true;
			}
		}
		if (playInBackground) {
			await this.playAudioInBackground(audioPromise, options);
		}
	}

	/**
	 * @param {OptionsIpa} options
	 * @returns {Promise<string | null>}
	 */
	async fetchIpa(options) {
		if (!options.enabled) {
			console.log("Show IPA is disabled");
			return null;
		}
		const input = this.pi.input;
		/** @type {string | null} */
		let ipa = this.ipaTextCache.get(input) ?? null;
		if (ipa) {
			return ipa;
		}
		ipa = await this.ipaTable.getValue(input);
		if (!ipa) {
			const { value, save } = await this.fetchIpaExternally(
				options,
			);
			if (!value) {
				return null;
			}
			ipa = value;
			if (save) {
				console.log(`Adding ${input} to ipa storage`);
				await this.ipaTable.set(input, ipa);
			}
		}
		this.ipaCache.set(input, ipa);
		return ipa;
	}

	/**
	 * @param {OptionsAudio} options
	 * @returns {Promise<string | null>}
	 */
	async fetchAudio(options) {
		if (!options.enabled) {
			console.log("Play audio is disabled");
			return null;
		}
		const input = this.pi.input;
		/** @type {string | null} */
		let url = this.audioCache.get(input) ?? null;
		if (url) {
			return url;
		}
		url = await this.audioTable.getValue(input);
		if (!url) {
			const { value, save } = await this.fetchAudioExternally(
				options,
			);
			if (!value) {
				return null;
			}
			url = value;
			if (save) {
				console.log(`Adding ${input} to audio storage`);
				await this.audioTable.set(input, url);
			}
		}
		this.audioCache.set(input, url);
		return url;
	}

	/**
	 * @param {OptionsIpa} options
	 * @returns {Promise<string | null>}
	 */
	async fetchIpaText(options) {
		if (!options.text.enabled) {
			console.log("Show IPA is disabled to text");
			return null;
		}
		const key = await this.pi.key();
		if (!this.ipaTextCache.hasKey(key)) {
			const { value } = await this.fetchIpaExternally(options);
			if (!value) {
				return null;
			}
			this.ipaTextCache.set(key, value);
		}
		return this.ipaTextCache.get(key);
	}

	/**
	 * @param {OptionsAudio} options
	 * @returns {Promise<string | null>}
	 */
	async fetchAudioText(options) {
		if (!options.text.enabled) {
			console.log("Play audio is disabled to text");
			return null;
		}
		const key = await this.pi.key();
		/** @type {string | null} */
		let url = this.audioTextCache.get(key) ?? null;
		if (url) {
			return url;
		}
		url = await this.audioTextTable.getValue(key);
		if (!url) {
			const { value, save } = await this.fetchAudioExternally(
				options,
			);
			if (!value) {
				return null;
			}
			url = value;
			if (save && options.text.save) {
				let short = this.pi.input;
				if (short.length > 15) {
					const begin = short.slice(0, 7);
					const end = short.slice(-5);
					short = `${begin}...${end}`;
				}
				console.log(`Adding [${short}] to audioText storage`);
				await this.audioTextTable.set(key, url);
			}
		}
		this.audioTextCache.set(key, url);
		return url;
	}

	/**
	 * @param {OptionsIpa} options
	 * @returns {Promise<{ value: string | null, save: boolean }>}
	 */
	async fetchIpaExternally(options) {
		/** @type {OffscreenMessage} */
		const message = {
			target: "offscreen",
			type: "fetchIpaExternally",
			origin: this.origin,
			fetchIpaExternally: {
				options,
				rawInput: this.pi.raw,
				allowText: this.pi.allowText,
				sourcesLastError: await this.sourceLastErrorTable.getAll(),
			},
		};
		/** @type {fetchExternallyReturn} */
		const returned = await chrome.runtime.sendMessage(message);
		const {
			value,
			save,
			le,
			showLe,
		} = returned;
		await this.sourceLastErrorTable.setMany(le);
		for (const lastError of showLe) {
			const closeTimeout = 5000;
			await this.showInfo(lastError, closeTimeout);
			await sleep(closeTimeout + 1000);
		}
		return {
			value,
			save,
		};
	}

	/**
	 * @param {OptionsAudio} options
	 * @returns {Promise<{ value: string | null, save: boolean }>}
	 */
	async fetchAudioExternally(options) {
		/** @type {OffscreenMessage} */
		const message = {
			target: "offscreen",
			type: "fetchAudioExternally",
			origin: this.origin,
			fetchAudioExternally: {
				options,
				rawInput: this.pi.raw,
				allowText: this.pi.allowText,
				sourcesLastError: await this.sourceLastErrorTable.getAll(),
			},
		};
		/** @type {fetchExternallyReturn} */
		const returned = await chrome.runtime.sendMessage(message);
		const {
			value,
			save,
			le,
			showLe,
		} = returned;
		await this.sourceLastErrorTable.setMany(le);
		for (const lastError of showLe) {
			const closeTimeout = 5000;
			await this.showInfo(lastError, closeTimeout);
			await sleep(closeTimeout + 1000);
		}
		return {
			value,
			save,
		};
	}

	/**
	 * @param {any} message
	 * @returns {Promise<any>}
	 */
	async sendMessage(message) {
		return chrome.tabs.sendMessage(this.tabId, message);
	}

	/**
	 * @param {string} info
	 * @param {number} closeTimeout
	 * @returns {Promise<void>}
	 */
	async showInfo(info, closeTimeout=5000) {
		/** @type {ClientMessage} */
		const message = {
			target: "client",
			type: "showPopup",
			origin: this.origin,
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
		await this.sendMessage(message);
	}

}
