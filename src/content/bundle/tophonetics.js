(function () {
	'use strict';

	function $(selectors, target=document) {
		return target.querySelector(selectors);
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

	function digits() {
		return "0123456789";
	}

	function alphanumeric() {
		return letters() + digits();
	}

	function symbolsFragment() {
		return "_";
	}

	function isLetter(character) {
		return letters().indexOf(character) > -1;
	}

	function isNumber(character) {
		return digits().indexOf(character) > -1;
	}

	function isAlphanumeric(character) {
		return isLetter(character) || isNumber(character);
	}

	function toArray(value) {
		return Array.isArray(value) ? value : [value];
	}

	function toObject(value) {
		return typeof value === "object" ? value : { [value]: value };
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
			reader.addEventListener("load", onLoad);
			reader.addEventListener("error", onError);
			reader.readAsDataURL(blob);

			function onLoad(e) {
				removeListeners();
				return resolve(e.target.result);
			}

			function onError(error) {
				removeListeners();
				return reject(error);
			}

			function removeListeners() {
				reader.removeEventListener("load", onLoad);
				reader.removeEventListener("error", onError);
			}
		});
	}

	function url2audio(url) {
		return new Promise((resolve, reject) => {
			const audio = new Audio(url);
			audio.addEventListener("canplay", onCanPlay);
			audio.addEventListener("error", onError);

			function onCanPlay() {
				removeListeners();
				return resolve(audio);
			}

			function onError(error) {
				removeListeners();
				return reject(error);
			}

			function removeListeners() {
				audio.removeEventListener("canplay", onCanPlay);
				audio.removeEventListener("error", onError);
			}
		});
	}

	async function asyncReduce(arr, initialValue, callback) {
		let currentValue = initialValue;
		for (const element of arr) {
			currentValue = await callback(currentValue, element);
		}
		return currentValue;
	}

	async function setAudio(word, audio, audioTable) {
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
		closeShortcut="\\",
		closeOnScroll=false,
	}={}) {
		const popup = tag("div");
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
		letter-spacing: .8px;
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
		closeButton.addEventListener("mouseover", onMouseOver);
		closeButton.addEventListener("mouseleave", onMouseLeave);
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("scroll", onScroll);
		target.appendChild(popup);

		function disableTimeout() {
			clearTimeout(timeoutID);
			popup.removeEventListener("mousedown", disableTimeout);
			document.removeEventListener("scroll", onScroll);
		}

		function onMouseOver() {
			closeButton.style.color = "#111111";
		}

		function onMouseLeave() {
			closeButton.style.color = closeButtonColor;
		}

		function onKeyDown(e) {
			if (e.key.toUpperCase() === closeShortcut) {
				closePopup();
			}
		}

		function onScroll() {
			if (closeOnScroll) {
				closePopup();
			}
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
			return (
				!Array.isArray(key) ?
				table[key] :
				key.reduce((obj, k) => {
					return { ...obj, [k]: table[k] };
				}, {})
			);
		}

		async set(key, value) {
			let table = await this.getAll();
			if (value !== undefined) {
				table[key] = value;
			} else {
				if (Array.isArray(table)) {
					table = [...table, ...toArray(key)];
				} else {
					table = { ...table, ...toObject(key) };
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

		async remove(keys) {
			const table = await this.getAll();
			for (const key of toArray(keys)) {
				delete table[key];
			}
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
			this.tables = allFragmentsInArray()
				.reduce((tables, fragment) => {
					return {
						...tables,
						[fragment]: new Table(`${fragment}${this.name}`, database),
					};
				}, {});
		}

		async get(key) {
			return this.tables[key2fragment(key)].get(key);
		}

		async set(key, value, atFragment) {
			const fragment = key2fragment(!atFragment ? key : atFragment);
			return this.tables[fragment].set(key, value);
		}

		async bulkSet(obj) {
			const fragmented = fragmentObject(obj);
			for (const [key, value] of Object.entries(fragmented)) {
				await this.set(value, undefined, key);
			}
		}

		async getAll(fragment) {
			if (fragment) {
				return this.tables[fragment].getAll();
			} else {
				return asyncReduce(
					allFragmentsInArray(),
					{},
					async (obj, fragment) => {
						return {
							...obj,
							...await this.getAll(fragment),
						};
					},
				);
			}
		}

		async getKeys() {
			return Object.keys(await this.getAll());
		}

		async remove(keys) {
			const fragmented = toArray(keys).reduce((sorted, key) => {
				const fragment = key2fragment(key);
				if (sorted[fragment] === undefined) {
					sorted[fragment] = [];
				}
				sorted[fragment].push(key);
				return sorted;
			}, {});
			for (const [fragment, sortedKeys] of Object.entries(fragmented)) {
				await this.tables[fragment].remove(sortedKeys);
			}
		}
	}

	function allFragmentsInArray() {
		return `${alphanumeric()}${symbolsFragment()}`.split("");
	}

	function key2fragment(key) {
		const value = (
			isString(key)? key :
			Array.isArray(key) ? key[0] :
			Object.keys(key)[0]
		);
		return isAlphanumeric(value[0]) ? value[0] : symbolsFragment();
	}

	function fragmentObject(obj) {
		const fragmented = {};
		for (const [key, value] of Object.entries(obj)) {
			const fragment = key2fragment(key);
			if (fragmented[fragment] === undefined) {
				fragmented[fragment] = {};
			}
			fragmented[fragment][key] = value;
		}
		return fragmented;
	}

	const database = localStorage;
	const ipaTable = new TableFragmented("ipa", database);
	const ipaDefaultTable = new Table("ipaDefault", database);
	const optionsTable = new Table("options", database);
	const audioTable = new TableFragmented("audio", database);

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
		const shortcuts = await asyncReduce(
			Object.entries(options).filter(([, value]) => value === true),
			{},
			async (obj, [key]) => {
				return {
					...obj,
					[await optionsTable.get(key)]: key,
				};
			},
		);
		console.log("shortcuts", shortcuts);
		const keys = Object.keys(shortcuts);
		document.addEventListener("keydown", async (e) => {
			const key = e.key.toUpperCase();
			if (e.ctrlKey && keys.includes(key)) {
				try {
					e.preventDefault();
					const fns = {
						"setAudioShortcut": async () => {
							const audio = await url2audio(getAudio());
							feedback(await setAudio(getWord(), audio.src, audioTable));
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

	function nothing() {
		throw new Error("Function argument cannot be empty!");
	}
	async function setIpa(word, ipa) {
		const oldIpa = await ipaTable.get(word);
		await ipaTable.set(word, ipa);
		feedback(`${word}: ${oldIpa} -> ${ipa}`);
	}

	function feedback(message) {
		console.log(message);
		showPopup({ message });
	}

	updateDatabaseWithWebsite(
		{
			setIpaShortcut: true,
			defaultIpaShortcut: true,
		},
		{
			getIpa,
			getWord,
		}
	)
		.then(() => console.log("update database with tophonetics"))
		.catch(console.error);

	function getWord() {
		return normalizeWord($("#text_to_transcribe").value);
	}

	function getIpa() {
		const span = $(".transcribed_word");
		if (!span) {
			throw new Error("IPA does not found!");
		}
		return `/${span.textContent}/`;
	}

})();
