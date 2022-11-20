import {
	optionsTable,
	ipaTable,
	audioTable,
	database,
} from "../tables.js";
import defaultOptions from "../default-options.js";
import {
	$,
	normalizeWord,
	isAlphanumeric,
	isNumber,
	toArray,
	file2object,
	blob2base64,
	url2audio,
} from "../utils.js";
import { speech, setAudio } from "../audio.js";
import downloadObject from "../download-object.js";

document.addEventListener("DOMContentLoaded", async () => {
	try {
		setFieldsValues(await optionsTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

element("options").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		await optionsTable.set(
			normalizeOptions(
				extractFieldsValues(await optionsTable.getKeys())
			),
		);
		const options = await optionsTable.getAll();
		setFieldsValues(options);
		console.log(options);
	} catch (error) {
		console.error(error);
	}
});

element("removeGoogleSpeechAudios").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		const words = Object
			.entries(await audioTable.getAll())
			.filter(([, value]) => value === speech)
			.map(([key]) => key);
		await audioTable.remove(words);
		console.log(`Google Speech removed ${words.length} audios`, words);
	} catch (error) {
		console.error(error);
	}
});

element("restoreDefaultOptions").addEventListener("click", (e) => {
	try {
		e.preventDefault();
		setOptions(defaultOptions);
	} catch (error) {
		console.error(error);
	}
});

element("setIPa").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		await ipaTable.set(
			normalizeWord(extractFieldValue("ipaWord")),
			extractFieldValue("ipa"),
		);
	} catch (error) {
		console.error(error);
	}
});

element("setAudio").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const word = normalizeWord(extractFieldValue("audioWord"));
		const file = extractFile("audio");
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
		const word = field.value;
		await audioTable.remove(word);
		console.log(`${word} audio removed`);
		field.value = "";
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

element("downloadOptionsTable").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		downloadObject(
			await optionsTable.getAll(),
			"pronunciation-options-table.json",
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
		const id = "ipaTable";
		const file = extractFile(id);
		if (file) {
			console.time(id);
			await ipaTable.bulkSet(await file2object(file));
			console.timeEnd(id);
		}
	} catch (error) {
		console.error(error);
	}
});

element("updateAudioTable").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const id = "audioTable";
		const file = extractFile(id);
		if (file) {
			console.time(id);
			await audioTable.bulkSet(await file2object(file));
			console.timeEnd(id);
		}
	} catch (error) {
		console.error(error);
	}
});

element("updateOptionsTable").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const id = "optionsTable";
		const file = extractFile(id);
		if (file) {
			console.time(id);
			setOptions(await file2object(file));
			console.timeEnd(id);
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
	element("audioFetchFileTimeout"),
	element("audioFetchScrapTimeout"),
	element("audioGoogleSpeechSpeed"),
	element("ipaFontSizePx"),
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

element("ipaFontFamily").addEventListener("keydown", (e) => {
	if (!isAlphanumeric(e.key) && e.key !== " " && !isNavigationKey(e)) {
		e.preventDefault();
	}
});

element("ipaCloseShortcut").addEventListener("keydown", (e) => {
	if (e.key.length === 1) {
		e.preventDefault();
		e.target.value = e.key.toUpperCase();
	}
});

function setOptions(options) {
	setFieldsValues(options);
	const form = element("options");
	if (form.reportValidity()) {
		form.requestSubmit();
	} else {
		optionsTable.getAll()
			.then(setFieldsValues)
			.catch(console.error);
		console.log("Invalid options!");
	}
}

function normalizeOptions(options) {
	return {
		...options,
		ipaEnabled: options.ipaEnabled === "true",
		ipaTimeout: parseFloat(options.ipaTimeout),
		ipaUseContextColors: options.ipaUseContextColors === "true",
		audioEnabled: options.audioEnabled === "true",
		audioVolume: Math.min(parseFloat(options.audioVolume), 1.0),
		audioPlaybackRate: Math.max(
			0.5,
			Math.min(
				2.0,
				parseFloat(options.audioPlaybackRate),
			),
		),
		audioFetchFileTimeout: parseFloat(options.audioFetchFileTimeout),
		audioFetchScrapTimeout: parseFloat(options.audioFetchScrapTimeout),
		audioGoogleSpeechSpeed: parseFloat(options.audioGoogleSpeechSpeed),
		ipaFontSizePx: parseFloat(options.ipaFontSizePx),
		ipaCloseShortcut: escapeShortcut(options.ipaCloseShortcut),
		ipaCloseOnScroll: options.ipaCloseOnScroll === "true",
	};
}

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

function setFieldsValues(ids2values) {
	for (const [id, value] of Object.entries(ids2values)) {
		setField(id, value);
	}
}

function setField(id, value) {
	return element(id).value = value;
}

function element(id) {
	return $(`#${id}`);
}

function extractFieldsValues(idFields) {
	return idFields.reduce((values, id) => {
		values[id] = extractFieldValue(id);
		return values;
	}, {});
}

function extractFieldValue(idField) {
	const field = element(idField);
	const value = field.value.trim();
	field.value = "";
	return value;
}

function extractFile(id) {
	const field = element(id);
	const file = field.files?.[0];
	field.value = "";
	return file;
}

function escapeShortcut(shortcut) {
	return shortcut !== "\\" && shortcut !== "\"" ? shortcut : `\\${shortcut}`;
}
