import {
	optionsTable,
	ipaTable,
	audioTable,
	database,
} from "../tables.js";
import defaultOptions from "../default-options.js";
import {
	$,
	print,
	normalizeWord,
	isAlphanumeric,
	isNumber,
	toArray,
	file2object,
	blob2base64,
	url2audio,
} from "../utils.js";
import { removeAudio, setAudio } from "../audio.js";
import downloadObject from "../download-object.js";

document.addEventListener("DOMContentLoaded", setFieldsInitialValues);

element("options").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const keys = await optionsTable.getKeys();
		const values = getFieldsValuesAndClean(keys);
		if (values.every((value) => value.length > 0)) {
			const options = keys.reduce((obj, key, i) => {
				return { ...obj, [key]: values[i] };
			}, {});
			await optionsTable.set({
				...options,
				accessKey: options.accessKey.toUpperCase(),
				ipaEnabled: options.ipaEnabled === "true",
				ipaTimeout: parseFloat(options.ipaTimeout),
				useWordColors: options.useWordColors === "true",
				audioEnabled: options.audioEnabled === "true",
				audioVolume: Math.min(parseFloat(options.audioVolume), 1.0),
				audioPlaybackRate: Math.max(
					0.5,
					Math.min(
						2.0,
						parseFloat(options.audioPlaybackRate),
					),
				),
				fetchFileAudioTimeout: parseFloat(options.fetchFileAudioTimeout),
				fetchScrapAudioTimeout: parseFloat(options.fetchScrapAudioTimeout),
				googleSpeechSpeed: parseFloat(options.googleSpeechSpeed),
				setAudioShortcut: options.setAudioShortcut.toUpperCase(),
				setIpaShortcut: options.setIpaShortcut.toUpperCase(),
				defaultIpaShortcut: options.defaultIpaShortcut.toUpperCase(),
				popupFontSizepx: parseFloat(options.popupFontSizepx),
				popupCloseOnScroll: options.popupCloseOnScroll === "true",
			});
		}
		await setFieldsInitialValues();
		console.log(await optionsTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

element("restoreDefaultOptions").addEventListener("click", async () => {
	try {
		await optionsTable.set(defaultOptions);
		await setFieldsInitialValues();
	} catch (error) {
		console.error(error);
	}
});

element("setIPa").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		await ipaTable.set(
			normalizeWord(getFieldValueAndClean("ipaWord")),
			getFieldValueAndClean("ipa"),
		);
	} catch (error) {
		console.error(error);
	}
});

element("setAudio").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const word = normalizeWord(getFieldValueAndClean("audioWord"));
		const file = getFileAndClean("audio");
		if (word && file) {
			const audio = await url2audio(await blob2base64(file));
			await setAudio(word, audio.src, audioTable);
		}
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

element("printOptionsTable").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		print(await optionsTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

element("downloadIpaTable").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		downloadObject(
			await ipaTable.getAll(),
			"pronunciation-ipa-table.json",
		)
			.then(console.log)
			.catch(console.error);
	} catch (error) {
		console.error(error);
	}
});

element("downloadAudioTable").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		downloadObject(
			await audioTable.getAll(),
			"pronunciation-audio-table.json",
		)
			.then(console.log)
			.catch(console.error);
	} catch (error) {
		console.error(error);
	}
});

element("downloadAllTables").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		downloadObject(
			await database.getAll(),
			"pronunciation-all-tables.json",
		)
			.then(console.log)
			.catch(console.error);
	} catch (error) {
		console.error(error);
	}
});

element("updateIPaTable").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const file = getFileAndClean("ipaTable");
		if (file) {
			console.time("ipaTable");
			await ipaTable.bulkSet(await file2object(file));
			console.timeEnd("ipaTable");
		}
	} catch (error) {
		console.error(error);
	}
});

element("updateAudioTable").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const file = getFileAndClean("audioTable");
		if (file) {
			console.time("audioTable");
			await audioTable.bulkSet(await file2object(file));
			console.timeEnd("audioTable");
		}
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

[
	element("ipaTimeout"),
	element("audioVolume"),
	element("audioPlaybackRate"),
	element("fetchFileAudioTimeout"),
	element("fetchScrapAudioTimeout"),
	element("googleSpeechSpeed"),
	element("popupFontSizepx"),
]
	.forEach((field) => field.addEventListener("keydown", (e) => {
		if (
			!isNumber(e.key) &&
			!isNavigationKey(e) &&
			(e.key !== "." || field.value.includes("."))
		) {
			e.preventDefault();
		}
	}));

element("popupFontFamily").addEventListener("keydown", (e) => {
	if (!isAlphanumeric(e.key) && e.key !== " " && !isNavigationKey(e)) {
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

async function setFieldsInitialValues() {
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

function getFieldsValuesAndClean(idFields) {
	return toArray(idFields).map(getFieldValueAndClean);
}

function getFieldValueAndClean(idField) {
	const field = element(idField);
	const value = field.value.trim();
	field.value = "";
	return value;
}

function getFileAndClean(id) {
	const field = element(id);
	const file = field.files?.[0];
	field.value = "";
	return file;
}
