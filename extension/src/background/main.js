import {
	utilsTable,
	ipaTable,
	ipaDefaultTable,
	optionsTable,
	audioTable,
} from "./tables.js";
import populateIpa from "./ipa/populate-ipa.js";
import populateOptions from "../options/populate-options.js";
import { isString, normalizeWord } from "../utils.js";
import { playAudio } from "./audio.js";
import fallbackIpa from "./fallback-ipa.js";

(async () => {
	try {
		populate(
			ipaTable,
			populateIpa,
			async () => ipaDefaultTable.set(await ipaTable.getAll()),
		)
			.then(console.log)
			.catch(console.error);
		await populate(optionsTable, populateOptions)
			.then(console.log)
			.catch(console.error);
		if (!browser.storage.onChanged.hasListener(storageOnChanged)) {
			browser.storage.onChanged.addListener(storageOnChanged);
		}
		setMenuItem(await optionsTable.get("accessKey"));
	} catch (error) {
		console.error(error);
	}
	return "Initialization finished";
})()
	.then(console.log)
	.catch(console.error);

async function populate(table, populateFn, afterPopulateFn) {
	if (!await utilsTable.get(table.name)) {
		await populateFn(table);
		if (afterPopulateFn) {
			await afterPopulateFn();
		}
		await utilsTable.set(table.name, true);
		return `${table.name} populated`;
	} else {
		return `${table.name} is already populated`;
	}
}

async function storageOnChanged(changes) {
	try {
		const accessKey = await optionsTable.get("accessKey");
		const updateMenuItem = (
			changes[optionsTable.name] &&
			await utilsTable.get("currentAccessKey") !== accessKey
		);
		if (updateMenuItem) {
			await setMenuItem(accessKey);
		}
	} catch (error) {
		console.error(error);
	}
}

async function menuItemOnClick(info, tab) {
	try {
		const word = normalizeWord(info.selectionText);
		if (!await isTabMuted() && await optionsTable.get("audioEnabled")) {
			const [
				audioVolume,
				fetchFileAudioTimeout,
				fetchScrapAudioTimeout,
				googleSpeechSpeed,
			] = await optionsTable.get([
				"audioVolume",
				"fetchFileAudioTimeout",
				"fetchScrapAudioTimeout",
				"googleSpeechSpeed",
			]);
			playAudio(
				word,
				{
					audioTable,
					audioVolume,
					fetchFileAudioTimeout,
					fetchScrapAudioTimeout,
					googleSpeechSpeed,
				},
			)
				.catch(console.error);
		}
		let ipa = await ipaTable.get(word);
		if (!ipa) {
			ipa = await fallbackIpa(word);
			if (ipa) {
				await ipaTable.set(word, ipa);
				console.log(`(ipa saved) ${word}: ${ipa}`);
			}
		}
		if (ipa) {
			const [
				timeout,
				family,
				sizepx,
				useWordColors,
			] = await optionsTable.get([
				"ipaTimeout",
				"popupFontFamily",
				"popupFontSizepx",
				"useWordColors",
			]);
			await scriptVariables({
				message: ipa,
				timeout,
				family,
				sizepx,
				useWordColors,
			});
			await executeScript({ file: "../content/bundle/main.js" });
		}
	} catch (error) {
		console.error(error);
	}

	async function isTabMuted() {
		return (await browser.tabs.get(tab.id)).mutedInfo.muted;
	}

	function executeScript(details) {
		return browser.tabs.executeScript(tab.id, details);
	}

	function scriptVariables(obj) {
		const variables = Object
			.entries(obj)
			.map(([variable, value]) => {
				return (
					isString(value) ?
					`${variable} = "${value}"` :
					`${variable} = ${value}`
				);
			});
		if (variables.length > 0) {
			return executeScript({
				code: `var ${variables.join(", ")};`,
			});
		}
	}
}

async function setMenuItem(accessKey) {
	await browser.menus.removeAll();
	await utilsTable.set("currentAccessKey", accessKey);
	return browser.menus.create({
		id: "Pronunciation",
		title: `&${accessKey} - Pronunciation`,
		contexts: ["selection"],
		onclick: menuItemOnClick,
	});
}
