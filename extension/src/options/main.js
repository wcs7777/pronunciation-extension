import {
	optionsTable,
	ipaTable,
	audioTable,
	database,
} from "../background/tables.js";
import defaultOptions from "./default-options.js";
import {
	$,
	print,
	normalizeWord,
	isAlphanumeric,
	isNumber,
} from "../utils.js";
import { removeAudio } from "../background/audio.js";

document.addEventListener("DOMContentLoaded", setFieldValues);

element("options").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const keys = await optionsTable.getKeys();
		const values = getFieldsAndClean(keys);
		if (values.every((value) => value.length > 0)) {
			const options = keys.reduce((obj, key, i) => {
				return { ...obj, [key]: values[i] };
			}, {});
			await optionsTable.set({
				...options,
				accessKey: options.accessKey.toUpperCase(),
				useWordColors: options.useWordColors === "true",
				audioEnabled: options.audioEnabled === "true",
				setAudioShortcut: options.setAudioShortcut.toUpperCase(),
				setIpaShortcut: options.setIpaShortcut.toUpperCase(),
				defaultIpaShortcut: options.defaultIpaShortcut.toUpperCase(),
			});
		}
		await setFieldValues();
		console.log(await optionsTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

element("restoreDefaultOptions").addEventListener("click", async () => {
	try {
		for (const [key, value] of Object.entries(defaultOptions)) {
			await optionsTable.set(key, value);
		}
		await setFieldValues();
	} catch (error) {
		console.error(error);
	}
});

element("clearAudioTable").addEventListener("click", async () => {
	try {
		await audioTable.removeAll();
	} catch (error) {
		console.error(error);
	}
});

element("setIPa").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		await ipaTable.set(
			normalizeWord(getFieldsAndClean ("ipaWord")),
			getFieldsAndClean ("ipa"),
		);
	} catch (error) {
		console.error(error);
	}
});

element("removeAudio").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const field = element("word");
		await removeAudio(field.value, audioTable);
		field.value = "";
	} catch (error) {
		console.error(error);
	}
});

element("printIpaTable").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		print(await ipaTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

element("printAudioTable").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		print(await audioTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

element("printOptionsTable").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		print(await optionsTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

element("printAllTables").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		print(await database.getAll());
	} catch (error) {
		console.error(error);
	}
});

[
	element("accessKey"),
	element("setAudioShortcut"),
	element("setIpaShortcut"),
	element("defaultIpaShortcut"),
]
	.forEach((field) => field.addEventListener("keydown", (e) => {
		if (!isNavigationKey(e)) {
			e.preventDefault();
			if (isAlphanumeric(e.key)) {
				e.target.value = e.key.toUpperCase();
			}
		}
	}));

element("popupFontFamily").addEventListener("keydown", (e) => {
	if (!isAlphanumeric(e.key) && e.key !== " " && !isNavigationKey(e)) {
		e.preventDefault();
	}
});

element("popupFontSizepx").addEventListener("keydown", (e) => {
	if (!isNumber(e.key) && !isNavigationKey(e)) {
		e.preventDefault();
	}
});

function isNavigationKey(keydownEvent) {
	return keydownEvent.ctrlKey || [
		"Backspace",
		"Delete",
		"ArrowLeft",
		"ArrowRight",
		"Tab",
		"CapsLock",
		"Home",
		"End",
		"Enter",
	]
		.includes(keydownEvent.key);
}

async function setFieldValues() {
	try {
		for (const [key, value] of Object.entries(await optionsTable.getAll())) {
			setField(key, value);
		}
	} catch (error) {
		console.error(error);
	}
}

function setField(id, value) {
	return element(id).value = value;
}

function element(id) {
	return $(`#${id}`);
}

function getFieldsAndClean(idFields) {
	if (Array.isArray(idFields)) {
		return idFields.map((id) => {
			const field = element(id);
			const value = field.value.trim();
			field.value = "";
			return value;
		});
	} else {
		const field = element(idFields);
		const value = field.value.trim();
		field.value = "";
		return value;
	}
}
