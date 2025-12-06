import { addLoudnessLimiter } from "../utils/audio.js";
import { blob2base64 } from "../utils/element.js";
import { removeMethods } from "../utils/object.js";
import { threshold } from "../utils/number.js";

export default class Pronunciation {

	/**
	 * @param {{
	 *     pi: PronunciationInput,
	 *     position: PronunciationInput,
	 *     ipaSources: IpaSource[],
	 *     audioSources: AudioSource[],
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
		ipaSources,
		audioSources,
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
		this.ipaSources = ipaSources;
		this.audioSources = audioSources;
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
				const begin = text.slice(0, 60);
				const end = text.slice(-17);
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
		const tab = await browser.tabs.get(this.tabId);
		if (tab?.mutedInfo?.muted) {
			console.log(`Tab ${this.tabId} is muted`);
			return;
		}
		const audio = new Audio(url);
		audio.volume = threshold(0, 1, options.volume);
		audio.playbackRate = threshold(0.2, 2.0, options.playbackRate);
		if (options.limitLoudness) {
			await addLoudnessLimiter(audio).play();
		} else {
			await audio.play();
		}
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
		const tab = await browser.tabs.get(this.tabId);
		if (tab?.mutedInfo?.muted) {
			console.log(`Tab ${this.tabId} is muted`);
			return;
		}
		let playInBackground = (
			options.text.playerEnabled ||
			options.text.shortcutsEnabled
		);
		if (!playInBackground) {
			/**
			 * @type {ClientMessage}
			 */
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
		/**
		  * @type {string | null}
		  */
		let ipa = this.ipaTextCache.get(input) ?? null;
		if (ipa) {
			return ipa;
		}
		ipa = await this.ipaTable.getValue(input);
		if (!ipa) {
			const { ipa: ipaValue, save } = await this.fetchIpaExternally(
				options,
			);
			if (!ipaValue) {
				return null;
			}
			ipa = ipaValue;
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
		/**
		  * @type {string | null}
		  */
		let url = this.audioCache.get(input) ?? null;
		if (url) {
			return url;
		}
		url = await this.audioTable.getValue(input);
		if (!url) {
			const { audio, save } = await this.fetchAudioExternally(
				options,
			);
			if (!audio) {
				return null;
			}
			url = await blob2base64(audio);
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
			const { ipa } = await this.fetchIpaExternally(options);
			if (!ipa) {
				return null;
			}
			this.ipaTextCache.set(key, ipa);
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
		/**
		  * @type {string | null}
		  */
		let url = this.audioTextCache.get(key) ?? null;
		if (url) {
			return url;
		}
		url = await this.audioTextTable.getValue(key);
		if (!url) {
			const { audio, save } = await this.fetchAudioExternally(
				options,
			);
			if (!audio) {
				return null;
			}
			url = await blob2base64(audio);
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
	 * @returns {Promise<{ ipa: string | null, save: boolean }>}
	 */
	async fetchIpaExternally(options) {
		/**
		 * @type {{ [key: string]: PronunciationSourceLastError }}
		 */
		const le = await this.sourceLastErrorTable.getAll();
		const now = new Date();
		const datetime = now.toISOString();
		const timestamp = now.getTime();
		/**
		 * @type {IpaSource[]}
		 */
		const sources = this.ipaSources
			.map(S => new S(this.pi, options.sources[S.name], le[S.name]))
			.filter(s => s.enabled)
			.sort((l, r) => l.order - r.order);
		for (const s of sources) {
			try {
				console.log(`Searching IPA in ${s.name}`);
				const ipa = await s.fetch();
				if (ipa) {
					console.log(`IPA found in ${s.name}`);
					return { ipa, save: s.save };
				}
			} catch (error) {
				console.error(error);
				/**
				 * @type {PronunciationSourceLastError}
				 */
				const lastError = {
					source: s.name,
					datetime,
					status: error?.status,
					timestamp,
					message: error?.message,
					messageContentType: error?.messageContentType,
					error: removeMethods(error?.error ?? error),
				};
				await this.sourceLastErrorTable.set(s.name, lastError);
				if (
					options.showSourceLastError &&
					error?.status &&
					error.status !== 404
				) {
					await this.showInfo(`${s.name}: ${error.status}`);
				}
			}
		}
		return { ipa: null, save: false };
	}

	/**
	 * @param {OptionsAudio} options
	 * @returns {Promise<{ audio: Blob | null, save: boolean }>}
	 */
	async fetchAudioExternally(options) {
		/**
		 * @type {{ [key: string]: PronunciationSourceLastError }}
		 */
		const le = await this.sourceLastErrorTable.getAll();
		const now = new Date();
		const datetime = now.toISOString();
		const timestamp = now.getTime();
		/**
		 * @type {AudioSource[]}
		 */
		const sources = this.audioSources
			.map(S => new S(this.pi, options.sources[S.name], le[S.name]))
			.filter(s => s.enabled)
			.sort((l, r) => l.order - r.order);
		for (const s of sources) {
			try {
				console.log(`Searching audio in ${s.name}`);
				const audio = await s.fetch();
				if (audio) {
					console.log(`Audio found in ${s.name}`);
					return { audio, save: s.save };
				}
			} catch (error) {
				console.error(error);
				/**
				 * @type {PronunciationSourceLastError}
				 */
				const lastError = {
					source: s.name,
					datetime,
					status: error?.status,
					timestamp,
					message: error?.message,
					messageContentType: error?.messageContentType,
					error: removeMethods(error?.error ?? error),
				};
				await this.sourceLastErrorTable.set(s.name, lastError);
				if (
					options.showSourceLastError &&
					error?.status &&
					error.status !== 404
				) {
					await this.showInfo(`${s.name}: ${error.status}`);
				}
			}
		}
		return { audio: null, save: false };
	}

	/**
	 * @param {any} message
	 * @returns {Promise<any>}
	 */
	async sendMessage(message) {
		return browser.tabs.sendMessage(this.tabId, message);
	}

	/**
	 * @param {string} info
	 * @param {number} closeTimeout
	 * @returns {Promise<void>}
	 */
	async showInfo(info, closeTimeout=5000) {
		/**
		 * @type {ClientMessage}
		 */
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
