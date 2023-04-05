import { setAudio, speech } from "../utils/audio.js";
import defaultOptions from "../utils/default-options.js";
import downloadObject from "../utils/download-object.js";
import {
	audioTable,
	database,
	ipaTable,
	optionsTable
} from "../utils/tables.js";
import {
	blob2base64,
	byId,
	file2object,
	isAlphanumeric,
	isNumber,
	normalizeWord,
	url2audio
} from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
	try {
		setFieldsValues(await optionsTable.getAll());
	} catch (error) {
		console.error(error);
	}
});

byId("options").addEventListener("submit", async (e) => {
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

byId("removeGoogleSpeechAudios").addEventListener("click", async (e) => {
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

byId("restoreDefaultOptions").addEventListener("click", (e) => {
	try {
		e.preventDefault();
		setOptions(defaultOptions);
	} catch (error) {
		console.error(error);
	}
});

byId("setIPa").addEventListener("submit", async (e) => {
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

byId("setAudio").addEventListener("submit", async (e) => {
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

byId("removeAudio").addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		const field = byId("word");
		const word = field.value;
		await audioTable.remove(word);
		console.log(`${word} audio removed`);
		field.value = "";
	} catch (error) {
		console.error(error);
	}
});

byId("downloadIpaTable").addEventListener("click", async (e) => {
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

byId("downloadAudioTable").addEventListener("click", async (e) => {
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

byId("downloadOptionsTable").addEventListener("click", async (e) => {
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

byId("downloadAllTables").addEventListener("click", async (e) => {
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

byId("updateIPaTable").addEventListener("submit", async (e) => {
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

byId("updateAudioTable").addEventListener("submit", async (e) => {
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

byId("updateOptionsTable").addEventListener("submit", async (e) => {
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
	byId("accessKey"),
	byId("setAudioShortcut"),
	byId("setIpaShortcut"),
	byId("defaultIpaShortcut"),
	byId("ipaCloseShortcut"),
]
	.forEach(onlyShortcut);

[
	byId("ipaTimeout"),
	byId("ipaFontSizePx"),
	byId("audioVolume"),
	byId("audioPlaybackRate"),
	byId("audioFetchFileTimeout"),
	byId("audioFetchScrapTimeout"),
	byId("audioGoogleSpeechSpeed"),
]
	.forEach(onlyFloat);

onlyAlphanumeric(byId("ipaFontFamily"));

function setOptions(options) {
	setFieldsValues(options);
	const form = byId("options");
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
	return byId(id).value = value;
}

function extractFieldsValues(idFields) {
	return idFields.reduce((values, id) => {
		values[id] = extractFieldValue(id);
		return values;
	}, {});
}

function extractFieldValue(idField) {
	const field = byId(idField);
	const value = field.value.trim();
	field.value = "";
	return value;
}

function extractFile(id) {
	const field = byId(id);
	const file = field.files?.[0];
	field.value = "";
	return file;
}

function onlyAlphanumeric(target) {
	target.addEventListener("keydown", (e) => {
		if (!isAlphanumeric(e.key) && e.key !== " " && !isNavigationKey(e)) {
			e.preventDefault();
		}
	});
}

function onlyFloat(target) {
	target.addEventListener("keydown", (e) => {
		if (
			!isNumber(e.key) &&
			(e.key !== "." || e.target.value.includes(".")) &&
			!isNavigationKey(e) &&
			true
		) {
			e.preventDefault();
		}
	});
}

function onlyShortcut(target) {
	target.addEventListener("keydown", (e) => {
		if (e.key.length === 1) {
			e.preventDefault();
			e.target.value = e.key.toUpperCase();
		}
	});
}
