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

	const template = createTemplate();
	document.body.appendChild(template);

	/**
	 * @type {OptionsPopup}
	 */
	const defaultOptionsPopup = {
		text: "Default text",
		font: {
			family: "Arial, serif",
			size: 20,
			color: "#282828",
			backgroundColor: "#FFFFFF",
		},
		close: {
			timeout: 3000,
			shortcut: "\\",
			onScroll: false,
			buttonColor: "#737373",
			buttonHoverColor: "#010101",
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
		const host = document.createElement("span");
		host.dataset.role = "pronunciation-addon-popup-host";
		host.style.display = "inline";
		host.style.width = "0px";
		host.style.height = "0px";
		host.style.border = "0px";
		host.style.margin = "0px";
		host.style.padding = "0px";
		const shadow = host.attachShadow({
			mode: "closed",
			clonable: false,
		});
		shadow.appendChild(template.content.cloneNode(true));

		/**
		 * @param {string} role
		 * @returns {HTMLElement | null}
		 */
		const byRole = (role) => shadow.querySelector(`[data-role="${role}"]`);

		byRole("text").textContent = opt.text;
		console.log({ pronuciationPopupText: opt.text });

		const popup = byRole("popup");
		const close = byRole("close");

		/**
		 * @param {string} prop
		 * @param {string} val
		 * @returns {void}
		 */
		const setProperty = (prop, val) => popup.style.setProperty(prop, val);

		setProperty("--top", `${opt.position.top}px`);
		setProperty("--left", `${opt.position.left}px`);
		setProperty("--background-color", opt.font.backgroundColor);
		setProperty("--font-family", opt.font.family);
		setProperty("--font-size", `${opt.font.size}px`);
		setProperty("--font-color", opt.font.color);
		setProperty("--close-button-color", opt.close.buttonColor);
		setProperty("--close-button-color-hover", opt.close.buttonHoverColor);

		popup.style.visibility = "hidden";
		document.body.appendChild(host);
		const rect = popup.getBoundingClientRect();
		const rightMargin = window.innerWidth - rect.right;
		if (rightMargin <= 0) {
			popup.style.right = "5px";
		}
		popup.style.visibility = "visible";

		const timeoutId = setTimeout(closePopup, opt.close.timeout);
		popup.addEventListener("mousedown", disableTimeout);
		close.addEventListener("click", closePopup);
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("scroll", onScroll);

		function onScroll() {
			if (opt.close.onScroll) {
				closePopup();
			}
		}

		/**
		 * @param {KeyboardEvent} event
		 * @returns {void}
		 */
		function onKeyDown(event) {
			if (event.key.toUpperCase() === opt.close.shortcut) {
				event.preventDefault();
				closePopup();
			}
		}

		function disableTimeout() {
			clearTimeout(timeoutId);
			popup.removeEventListener("mousedown", disableTimeout);
			document.removeEventListener("scroll", onScroll);
		}

		function closePopup() {
			disableTimeout();
			close.removeEventListener("click", closePopup);
			document.removeEventListener("keydown", onKeyDown);
			host.remove();
		}

	}

	/**
	 * @returns {HTMLTemplateElement}
	 */
	function createTemplate() {
	const html = `

<!-- Code injected by How2Say addon -->

<style>

:where(div, span) {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	border: 0;
}

.popup {
	--top: 20px;
	--left: 20px;
	--background-color: #FFFFFF;
	--font-family: Arial, serif;
	--font-size: 20px;
	--font-color: #282828;
	--close-button-color: #737373;
	--close-button-color-hover: #010101;
	position: fixed;
	top: var(--top);
	left: var(--left);
	padding: 6px 8px 6px 9px;
	background-color: var(--background-color);
	box-shadow: rgba(0, 0, 0, 0.6) -1px 1px 3px 1px;
	font-family: var(--font-family);
	font-size: var(--font-size);
	font-style: normal;
	font-weight: 400;
	line-height: 1.2;
	letter-spacing: .8px;
	word-spacing: 6px;
	text-wrap: wrap;
	text-wrap: pretty;
	color: var(--font-color);
	z-index: 999999;
}

.close {
	position: absolute;
	top: 0;
	left: 0;
	display: inline-block;
	padding: 0 1px 0;
	background-color: inherit;
	border: none;
	font: 12px/1.0 'Arial', sans-serif;
	font-style: normal;
	text-align: center;
	text-decoration: none;
	white-space: nowrap;
	color: var(--close-button-color);
	cursor: pointer;
	overflow: hidden;
}

.close:hover {
	color: var(--close-button-color-hover);
	background-color: transparent;
	transform: scale(1.5);
}

</style>

<div class="popup" data-role="popup">
	<span class="close" data-role="close">&#215;</span>
	<span data-role="text">Default text</span>
</div>

`;
		const template = document.createElement("template");
		template.id = "pronunciation-addon-popup-template";
		template.innerHTML = html;
		return template;
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

	/*
	a
	control
	defaultIpa
	defaultOptions
	errorsTable
	i
	options
	ta
	*/

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
				const rawWord = document
					.querySelector("span.hw.dhw")
					.textContent
					.trim()
					.toLowerCase();
				const word = splitWords(rawWord)[0].toLowerCase();
				console.log("Pronunciation shortcut", { word });
				const cb = {
					[options.ipaShortcut]: async () => {
						const rawIpa = document.querySelector("span.ipa")
							.textContent
							.trim();
						const ipa = `/${rawIpa}/`;
						console.log("Pronunciation shortcut", { ipa });
						const oldIpa = await ipaTable.getValue(word, false);
						await ipaTable.set(word, ipa);
						showPopup({ text: `${oldIpa} -> ${ipa}` });
					},
					[options.audioShortcut]: async () => {
						const src = document
							.querySelector("span.us audio source")
							?.getAttribute("src");
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

	(async () => main())().catch(console.error);

})();
