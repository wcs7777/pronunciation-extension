(function () {
	'use strict';

	function $(selectors, target=document) {
		return target.querySelector(selectors);
	}

	function $$(selectors, target=document) {
		return Array.from(target.querySelectorAll(selectors));
	}

	function tag(tagName) {
		return document.createElement(tagName);
	}

	function textNode(data) {
		return document.createTextNode(data);
	}

	function normalizeWord(word) {
		return word
			.trim()
			.toLowerCase()
			.replaceAll(/(\.|,|\?|!|")/g, '')
			.replaceAll("’", "'")
			.split(/\s+/)[0];
	}

	function letters() {
		return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	}

	function numbers() {
		return "0123456789";
	}

	function alphanumeric() {
		return letters() + numbers();
	}

	function symbolsFragment() {
		return "_";
	}

	function isLetter(character) {
		return letters().indexOf(character) > -1;
	}

	function isNumber(character) {
		return numbers().indexOf(character) > -1;
	}

	function isAlphanumeric(character) {
		return isLetter(character) || isNumber(character);
	}

	function isString(value) {
	  return Object.prototype.toString.call(value) === "[object String]"
	}

	async function url2base64(url, credentials="omit") {
		const response = await fetch(url, { credentials });
		return blob2base64(await response.blob());
	}

	function blob2base64(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = reject;
			reader.onload = (e) => resolve(e.target.result);
			reader.readAsDataURL(blob);
		});
	}

	var localStorage = {
		async set(key, value) {
			const keys = value !== undefined ? { [key]: value } : key;
			return browser.storage.local.set(keys);
		},

		async get(key) {
			const result = await browser.storage.local.get(key);
			return isString(key) ? result[key] : result;
		},

		async remove(keys) {
			return browser.storage.local.remove(keys);
		},

		async getAll() {
			return browser.storage.local.get();
		},
	};

	class Table {
		constructor(name="table", database) {
			this.name = name;
			this.database = database;
		}

		async get(key) {
			const table = await this.getAll();
			if (!Array.isArray(key)) {
				return table[key];
			} else {
				const values = [];
				for (const k of key) {
					values.push(table[k]);
				}
				return values;
			}
		}

		async set(key, value) {
			let table = await this.getAll();
			if (value !== undefined) {
				table[key] = value;
			} else {
				if (Array.isArray(table)) {
					if (Array.isArray(key)) {
						table = [...table, ...key];
					} else {
						table = [...table, key];
					}
				} else {
					if (typeof key === "object") {
						table = { ...table, ...key };
					} else {
						table = { ...table, [key]: key };
					}
				}
			}
			return this.database.set(this.name, table);
		}

		async getAll() {
			return await this.database.get(this.name) || {};
		}

		async getKeys() {
			return Object.keys(await this.getAll());
		}

		async remove(key) {
			const table = await this.getAll();
			delete table[key];
			return this.database.set(this.name, table);
		}

		async removeAll() {
			return this.database.remove(this.name);
		}
	}

	class TableFragmented {
		constructor(name="table", database) {
			this.name = name;
			this.database = database;
		}

		async get(key) {
			const table = await this.getAll(key2fragment(key));
			if (!Array.isArray(key)) {
				return table[key];
			} else {
				const values = [];
				for (const k of key) {
					values.push(table[k]);
				}
				return values;
			}
		}

		async set(key, value, atFragment) {
			const fragment = key2fragment(!atFragment ? key : atFragment);
			let table = await this.getAll(fragment);
			if (value !== undefined) {
				table[key] = value;
			} else {
				if (Array.isArray(table)) {
					if (Array.isArray(key)) {
						table = [...table, ...key];
					} else {
						table = [...table, key];
					}
				} else {
					if (typeof key === "object") {
						table = { ...table, ...key };
					} else {
						table = { ...table, [key]: key };
					}
				}
			}
			return this.database.set(this.name + fragment, table);
		}

		async getAll(fragment) {
			if (fragment) {
				return await this.database.get(this.name + fragment) || {};
			} else {
				let table = {};
				for (const fragment of alphanumeric() + symbolsFragment()) {
					const tableFragment = await this.getAll(fragment);
					table = { ...table, ...tableFragment };
				}
				return table;
			}
		}

		async getKeys() {
			return Object.keys(await this.getAll());
		}

		async remove(key) {
			const fragment = key2fragment(key);
			const table = await this.getAll(fragment);
			delete table[key];
			return this.database.set(this.name + fragment, table);
		}
	}

	function key2fragment(key) {
		const value = (
			isString(key)? key :
			Array.isArray(key) ? key[0] :
			Object.keys(key)[0]
		);
		return isAlphanumeric(value[0]) ? value[0] : symbolsFragment();
	}

	const database = localStorage;
	const ipaTable = new TableFragmented("ipa", database);
	const ipaDefaultTable = new Table("ipaDefault", database);
	const optionsTable = new Table("options", database);
	const audioTable = new Table("audio", database);
	new Table("utils", database);

	function canPlay(url) {
		return new Promise((resolve, reject) => {
			const audio = new Audio(url);
			audio.addEventListener("canplay", () => resolve(audio));
			audio.addEventListener("error", reject);
		});
	}

	async function setAudio(word, audio) {
		const value = (
			isUrl(audio) ? await url2base64(audio) : audio
		);
		await audioTable.set(word, value);
		const message = `${word} audio saved`;
		console.log(message);
		console.log(audio);
		return message;
	}

	function isUrl(value) {
		return isString(value) && value.startsWith("http");
	}

	function showPopup({
		message="message",
		timeout=3000,
		position={
			top: 100,
			left: 250,
		},
		font={
			family: "Arial",
			sizepx: 20,
		},
		target=document.body,
		color="rgb(40, 40, 40)",
		backgroundColor="rgb(255, 255, 255)",
	}={}) {
		const popup = tag("span");
		const closeButton = tag("span");
		const closeButtonColor = "#737373";
		const timeoutID  = setTimeout(closePopup, timeout);
		popup.style.cssText = `
		position: fixed;
		top: ${position.top}px;
		left: ${position.left}px;
		padding: 6px 12px 6px 8px;
		box-sizing: border-box;
		color: ${color};
		background-color: ${backgroundColor};
		box-shadow: rgba(0, 0, 0, 0.6) -1px 1px 3px 1px;
		font: ${font.sizepx}px/1.2 "${font.family}", serif;
		z-index: 99999;
	`;
		closeButton.style.cssText = `
		position: absolute;
		top: 0;
		right: 0;
		display: inline-block;
		padding: 0 1px 0;
		vertical-align: middle;
		color: ${closeButtonColor};
		background-color: inherit;
		border: none;
		font: 12px/1.0 "Arial", sans-serif;
		text-align: center;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		overflow: hidden;
	`;
		closeButton.appendChild(textNode("\u00D7"));
		popup.appendChild(textNode(message));
		popup.appendChild(closeButton);
		popup.addEventListener("mousedown", disableTimeout);
		closeButton.addEventListener("click", closePopup);
		closeButton.addEventListener("mouseover", () => {
			return closeButton.style.color = "#111111";
		});
		closeButton.addEventListener("mouseleave", () => {
			return closeButton.style.color = closeButtonColor;
		});
		target.appendChild(popup);

		function disableTimeout() {
			clearTimeout(timeoutID);
			document.removeEventListener("click", disableTimeout);
		}

		function closePopup() {
			popup.remove();
		}
	}

	async function updateDatabaseWithWebsite(
		options={
			setAudioShortcut=false,
			setIpaShortcut=false,
			defaultIpaShortcut=false,
		}={},
		{
			getWord=nothing,
			getIpa=nothing,
			getAudio=nothing,
		}={},
	) {
		const shortcuts = {};
		for (const option of Object.keys(options)) {
			if (options[option]) {
				shortcuts[await optionsTable.get(option)] = option;
			}
		}
		console.log("shortcuts", shortcuts);
		const keys = Object.keys(shortcuts);
		document.addEventListener("keydown", async (e) => {
			const key = e.key.toUpperCase();
			if (e.ctrlKey && keys.includes(key)) {
				try {
					e.preventDefault();
					const fns = {
						"setAudioShortcut": async () => {
							const playable = await canPlay(getAudio());
							if (playable) {
								feedback(await setAudio(getWord(), playable.src));
							}
						},
						"setIpaShortcut": async () => {
							return setIpa(getWord(), getIpa());
						},
						"defaultIpaShortcut": async () => {
							const word = getWord();
							return setIpa(word, await ipaDefaultTable.get(word));
						},
					};
					await fns[shortcuts[key]]();
				} catch (error) {
					console.error(error);
				}
			}
		});
	}

	const nothing = () => {
		throw new Error("Function argument cannot be empty!");
	};

	async function setIpa(word, ipa) {
		console.log("setIpa() word:", word);
		console.log("setIpa() ipa:", ipa);
		const oldIpa = await ipaTable.get(word);
		await ipaTable.set(word, ipa);
		feedback(`${word}: ${oldIpa} -> ${ipa}`);
	}

	function feedback(message) {
		console.log(message);
		showPopup({ message });
	}

	let lastAudioPlayed = $("div.sound.audio_play_button.pron-us");
	console.log(lastAudioPlayed);

	updateDatabaseWithWebsite(
		{
			defaultIpaShortcut: true,
			setIpaShortcut: true,
			setAudioShortcut: true,
		},
		{
			getAudio,
			getWord,
			getIpa,
		},
	)
		.then(() => console.log("update database with oxford"))
		.catch(console.error);

	for (const div of $$("div.sound.audio_play_button")) {
		div.addEventListener("click", () => lastAudioPlayed = div);
	}

	function getWord() {
		return normalizeWord(lastAudioPlayed.title);
	}

	function getIpa() {
		return lastAudioPlayed.nextElementSibling.textContent;
	}

	function getAudio() {
		return lastAudioPlayed.dataset.srcOgg;
	}

})();