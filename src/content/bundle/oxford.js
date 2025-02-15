(function () {
	'use strict';

	const wordPattern = /([A-Za-z\u00C0-\u024F\-']+)/g;

	/**
	 * @param {string} text
	 * @returns {string[]}
	 */
	function splitWords(text) {
		const words = text
			.trim()
			.replaceAll("’", "'")
			.match(wordPattern);
		return words ? words : [];
	}

	/**
	 * @param {string} url
	 * @returns {Promise<Blob>}
	 */
	async function url2blob(url, credentials="omit") {
		const response = await fetch(url, { credentials });
		const status = response.status;
		if (status !== 200) {
			const message = await response.text();
			throw {
				status,
				message,
				error: new Error(response.statusText),
			};
		}
		const blob = await response.blob();
		return blob;
	}

	/**
	 * @param {Blob} blob
	 * @returns {Promise<string>}
	 */
	async function blob2base64(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("load", onLoad);
			reader.addEventListener("error", onError);
			reader.readAsDataURL(blob);

			/**
			 * @param {ProgressEvent<FileReader>} event
			 * @returns {void}
			 */
			function onLoad(event) {
				removeListeners();
				return resolve(event.target.result);
			}

			/**
			 * @param {ErrorEvent} error
			 * @returns {void}
			 */
			function onError(error) {
				removeListeners();
				return reject(error);
			}

			/**
			 * @returns {void}
			 */
			function removeListeners() {
				reader.removeEventListener("load", onLoad);
				reader.removeEventListener("error", onError);
			}

		});
	}

	/**
	 * @type {OptionsPopup}
	 */
	const defaultOptionsPopup = {
		target: document.body,
		text: "default text",
		font: {
			family: "Arial",
			size: 20,
			color: "#282828",
			backgroundColor: "#FFFFFF",
		},
		close: {
			timeout: 3000,
			shortcut: "\\",
			onScroll: false,
		},
		position: {
			top: 100,
			left: 250,
		},
	};

	/**
	 * @param {OptionsPopup} options
	 * @returns {void}
	 */
	function showPopup(options) {
		/**
		 * @type {OptionsPopup}
		 */
		const opt = { ...defaultOptionsPopup, ...options };
		const popup = document.createElement("div");
		const closeButton = document.createElement("span");
		const closeColor = "#737373";
		const timeoutId = setTimeout(closePopup, opt.close.timeout);
		console.log({ pronuciationPopupText: opt.text });
		popup.style.cssText = `
		position: fixed;
		top: ${opt.position.top}px;
		left: ${opt.position.left}px;
		box-sizing: border-box;
		padding: 6px 8px 6px 9px;
		background-color: ${opt.font.backgroundColor};
		box-shadow: rgba(0, 0, 0, 0.6) -1px 1px 3px 1px;
		font-family: ${opt.font.family}, serif;
		font-size: ${opt.font.size}px;
		font-style: normal !important;
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: .8px;
		word-spacing: 6px;
		text-wrap: wrap;
		text-wrap: pretty;
		color: ${opt.font.color};
		z-index: 99999 !important;
	`;
		closeButton.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		display: inline-block;
		padding: 0 1px 0;
		background-color: inherit;
		border: none;
		font: 12px/1.0 'Arial', sans-serif;
		font-style: normal !important;
		vertical-align: middle;
		text-align: center;
		text-decoration: none;
		white-space: nowrap;
		color: ${closeColor};
		cursor: pointer;
		overflow: hidden;
	`;
		closeButton.appendChild(document.createTextNode("\u00D7"));
		popup.appendChild(document.createTextNode(opt.text));
		popup.appendChild(closeButton);

		const onMouseOver = () => { closeButton.style.color = "#111111"; };
		const onMouseLeave = () => { closeButton.style.color = closeColor; };
		const onScroll = () => { opt.close.onScroll && closePopup(); };
		/**
		 * @param {KeyboardEvent} event
		 * @returns {void}
		 */
		const onKeyDown = (event) => {
			if (event.key.toUpperCase() === opt.close.shortcut) {
				closePopup();
			}	};

		function disableTimeout() {
			clearTimeout(timeoutId);
			popup.removeEventListener("mousedown", disableTimeout);
			document.removeEventListener("scroll", onScroll);
		}

		function closePopup() {
			popup.removeEventListener("mousedown", disableTimeout);
			closeButton.removeEventListener("click", closePopup);
			closeButton.removeEventListener("mouseover", onMouseOver);
			closeButton.removeEventListener("mouseleave", onMouseLeave);
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("scroll", onScroll);
			popup.remove();
		}

		popup.addEventListener("mousedown", disableTimeout);
		closeButton.addEventListener("click", closePopup);
		closeButton.addEventListener("mouseover", onMouseOver);
		closeButton.addEventListener("mouseleave", onMouseLeave);
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("scroll", onScroll);

		popup.style.visibility = "hidden";
		opt.target.appendChild(popup);
		const rect = popup.getBoundingClientRect();
		const rightMargin = window.innerWidth - rect.right;
		popup.remove();
		if (rightMargin <= 0) {
			popup.style.right = "5px";
		}
		popup.style.visibility = "visible";
		opt.target.appendChild(popup);
	}

	/**
	 * @implements {Table}
	 */
	let TableByKeyPrefix$1 = class TableByKeyPrefix {

		/**
		 * @param {browser.storage.StorageArea} storage
		 * @param {string} keyPrefix
		 */
		constructor(storage, keyPrefix) {
			this.storage = storage;
			this.keyPrefix = keyPrefix;
		}

		get name() {
			return this.keyPrefix;
		}

		/**
		  * @param {string} key
		  * @param {any} key
		  * @returns {Promise<void>}
		  */
		async set(key, value) {
			return this.storage.set({ [this.fullKey(key)]: value });
		}

		/**
		  * @param {{ [key: string]: any }} values
		  * @returns {Promise<void>}
		  */
		async setMany(values) {
			const prefixed = Object
				.entries(values)
				.reduce((previous, [key, value]) => {
					previous[this.fullKey(key)] = value;
					return previous;
				}, {});
			return this.storage.set(prefixed);
		}

		/**
		  * @param {string | string[] | null} keys
		  * @param {boolean} throwNotFound
		  * @returns {Promise<{ [key: string]: any }>}
		  */
		async get(keys, throwNotFound=true) {
			const removePrefix = false;
			let values = {};
			if (keys !== null && keys != undefined) {
				values = await this.storage.get(this.fullKeys(keys));
				if (
					throwNotFound &&
					keys.length > 0 &&
					Object.keys(values).length === 0
				) {
					throw Error(`${keys} not found`);
				}
			} else {
				const allKeys = await this.getKeys(removePrefix);
				values = await this.storage.get(allKeys);
			}
			return Object.entries(values)
				.reduce((withoutKeyPrefix, [key, value]) => {
					const k = this.removeKeyPrefix(key);
					withoutKeyPrefix[k] = value;
					return withoutKeyPrefix;
				}, {});
		}

		/**
		  * @returns {Promise<number>}
		  */
		async size() {
			const removePrefix = false;
			const keys = await this.getKeys(removePrefix);
			return keys.length;
		}

		/**
		  * @param {string} key
		  * @param {boolean} throwNotFound
		  * @returns {Promise<any>}
		  */
		async getValue(key, throwNotFound=true) {
			const results = await this.get(key, throwNotFound);
			return results[key];
		}

		/**
		  * @param {string | string[] | null} keys
		  * @param {boolean} throwNotFound
		  * @returns {Promise<any[]>}
		  */
		async getValues(keys, throwNotFound) {
			return Object.values(await this.get(keys, throwNotFound));
		}

		/**
		  * @param {boolean} removePrefix
		  * @returns {Promise<{ [key: string]: any }>}
		  */
		async getAll(removePrefix=true) {
			/**
			 * @type {{ [key: string]: any }}
			 */
			const stored = await this.storage.get();
			return Object
				.entries(stored)
				.filter(([k, _]) => k.startsWith(this.keyPrefix))
				.reduce((previous, [key, value]) => {
					const k = removePrefix ? this.removeKeyPrefix(key) : key;
		 			previous[k] = value;
					return previous;
				}, {});
		}

		/**
		  * @param {boolean} removePrefix
		  * @returns {Promise<string[]>}
		  */
		async getKeys(removePrefix=true) {
			return Object.keys(await this.getAll(removePrefix));
		}

		/**
		  * @param {string | string[]} keys
		  * @returns {Promise<void>}
		  */
		async remove(keys) {
			return this.storage.remove(this.fullKeys(keys));
		}

		/**
		  * @returns {Promise<void>}
		  */
		async clear() {
			const removePrefix = false;
			const keys = await this.getKeys(removePrefix);
			return this.storage.remove(keys);
		}

		/**
		  * @param {string} key
		  * @returns {string}
		  */
		fullKey(key) {
			if (!key) {
				throw Error("key must be passed");
			}
			return `${this.keyPrefix}${key}`;
		}

		/**
		  * @param {string | string[]} keys
		  * @returns {string[]}
		  */
		fullKeys(keys) {
			const keysArray = Array.isArray(keys) ? keys : [keys];
			return keysArray.map((key) => this.fullKey(key));
		}

		/**
		  * @param {string} key
		  * @returns {string}
		  */
		removeKeyPrefix(key) {
			return key.replace(this.keyPrefix, "");
		}

	};

	/**
	 * @implements {Table}
	 */
	class TableByKeyPrefix {

		/**
		 * @param {browser.storage.StorageArea} storage
		 * @param {string} parentkey
		 */
		constructor(storage, parentkey) {
			this.storage = storage;
			this.parentKey = parentkey;
		}

		get name() {
			return this.parentKey;
		}

		/**
		  * @param {string} key
		  * @param {any} key
		  * @returns {Promise<void>}
		  */
		async set(key, value) {
			const results = await this.getAll();
			results[key] = value;
			return this.storage.set({ [this.parentKey]: results });
		}

		/**
		  * @param {{ [key: string]: any }} values
		  * @returns {Promise<void>}
		  */
		async setMany(values) {
			const results = await this.getAll();
			return this.storage.set({
				[this.parentKey]: {...results, ...values },
			});
		}

		/**
		  * @param {string | string[] | null} keys
		  * @param {boolean} throwNotFound
		  * @returns {Promise<{ [key: string]: any }>}
		  */
		async get(keys, throwNotFound=true) {
			const results = await this.getAll();
			if (keys !== null && keys != undefined) {
				const keysArray = Array.isArray(keys) ? keys : [keys];
				const values = keysArray.reduce((filtered, key) => {
					if (key in results) {
						filtered[key] = results[key];
					}
					return filtered;
				}, {});
				if (
					throwNotFound &&
					keysArray.length > 0 &&
					Object.keys(values).length === 0
				) {
					throw Error(`${keys} not found`);
				}
				return values;
		 	} else {
				return results;
			}
		}

		/**
		  * @param {string} key
		  * @param {boolean} throwNotFound
		  * @returns {Promise<any>}
		  */
		async getValue(key, throwNotFound=true) {
			const result = await this.get(key, throwNotFound);
			return result[key];
		}

		/**
		  * @param {string | string[] | null} keys
		  * @param {boolean} throwNotFound
		  * @returns {Promise<any[]>}
		  */
		async getValues(keys, throwNotFound=true) {
			return Object.values(await this.get(keys, throwNotFound));
		}

		/**
		  * @returns {Promise<{ [key: string]: any }>}
		  */
		async getAll() {
			const results = await this.storage.get(this.parentKey);
			return this.parentKey in results ? results[this.parentKey] : {};
		}

		/**
		  * @returns {Promise<string[]>}
		  */
		async getKeys() {
			return Object.keys(await this.getAll());
		}

		/**
		  * @returns {Promise<number>}
		  */
		async size() {
			const keys = await this.getKeys();
			return keys.length;
		}

		/**
		  * @param {string | string[]} keys
		  * @returns {Promise<void>}
		  */
		async remove(keys) {
			const results = await this.getAll();
			const keysArray = Array.isArray(keys) ? keys : [keys];
			const values = Object.entries(results)
				.reduce((filtered, [key, value]) => {
					if (!keysArray.includes(key)) {
						filtered[key] = value;
					}
					return filtered;
				}, {});
			return this.storage.set({ [this.parentKey]: values });
		}

		/**
		  * @returns {Promise<void>}
		  */
		async clear() {
			return this.storage.remove(this.parentKey);
		}

	}

	const addonStorage = browser.storage.local;
	const audioTable = new TableByKeyPrefix$1(addonStorage, "a");
	const ipaTable = new TableByKeyPrefix$1(addonStorage, "i");
	const defaultIpaTable = new TableByKeyPrefix(addonStorage, "defaultIpa");
	const optionsTable = new TableByKeyPrefix(addonStorage, "options");

	/**
	 * @returns {Promise<void>}
	 */
	async function main() {
		/**
		 * @type {OptionsSetPronuncationByShortcut}
		 */
		const options = await optionsTable.getValue("setPronuncationByShortcut");
		if (!options.enabled) {
			return;
		}
		console.log("Pronunciation shortcut enabled", { options });
		const audioElements = Array.from(
			document.querySelectorAll("div.sound.audio_play_button"),
		);
		/**
		 * @type {HTMLElement}
		 */
		let lastAudioPlayed = document.querySelector(
			"div.sound.audio_play_button.pron-us",
		);
		for (const element of audioElements) {
			element.addEventListener("click", () => {
				lastAudioPlayed = element;
			});
		}
		document.addEventListener("keydown", async (e) => {
			try {
				if (!e.ctrlKey) {
					return;
				}
				const key = e.key.toUpperCase();
				const shortcuts = [
					options.ipaShortcut,
					options.audioShortcut,
					options.restoreDefaultIpaShortcut,
				];
				if (!shortcuts.includes(key)) {
					return;
				}
				e.preventDefault();
				const cb = {
					[options.ipaShortcut]: async () => {
						const word = getWord(lastAudioPlayed);
						console.log("Pronunciation shortcut", { word });
						const ipa = lastAudioPlayed
							.nextElementSibling
							.textContent;
						console.log("Pronunciation shortcut", { ipa });
						const oldIpa = await ipaTable.getValue(word, false);
						await ipaTable.set(word, ipa);
						showPopup({ text: `${oldIpa} -> ${ipa}` });
					},
					[options.audioShortcut]: async () => {
						const word = getWord(lastAudioPlayed);
						console.log("Pronunciation shortcut", { word });
						const src = lastAudioPlayed.dataset?.srcOgg;
						if (!src) {
							showPopup({ text: `Audio not found for ${word}` });
							return;
						}
						const url = (
							src.startsWith("https://") ?
							src :
							`${window.location.origin}${src}`
						);
						console.log("Pronunciation shortcut", { url });
						const blob = await url2blob(url);
						const base64 = await blob2base64(blob);
						await audioTable.set(word, base64);
						showPopup({ text: `Audio saved for ${word}`});
					},
					[options.restoreDefaultIpaShortcut]: async () => {
						const word = getWord(lastAudioPlayed);
						console.log("Pronunciation shortcut", { word });
						const currentIpa = await ipaTable.getValue(
							word, false,
						);
						const defaultIpa = await defaultIpaTable.getValue(
							word, false,
						);
						if (defaultIpa) {
							await ipaTable.set(word, defaultIpa);
							showPopup({
								text: `${currentIpa} -> ${defaultIpa}`,
							});
						} else {
							showPopup({
								text: `There is no default IPA of ${word}`,
							});
						}
					},
				};
				await cb[key]();
			} catch (error) {
				console.error(error);
			}
		});
	}

	/**
	 * @param {HTMLElement} lastAudioPlayed
	 * @returns {string}
	 */
	function getWord(lastAudioPlayed) {
		const words = splitWords(lastAudioPlayed.title.trim().toLowerCase());
		return words[0];
	}

	(async () => main())().catch(console.error);

})();
