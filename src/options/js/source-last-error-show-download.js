import { byId, downloadObject } from "../../utils/element.js";
import { sourceLastErrorTable } from "../../utils/storage-tables.js";

/**
 * @type {{
 *     cambridge: HTMLInputElement,
 *     linguee: HTMLInputElement,
 *     oxford: HTMLInputElement,
 *     gstatic: HTMLInputElement,
 *     googleSpeech: HTMLInputElement,
 *     responsiveVoice: HTMLInputElement,
 *     unrealSpeech: HTMLInputElement,
 *     speechify: HTMLInputElement,
 *     playHt: HTMLInputElement,
 *     elevenLabs: HTMLInputElement,
 *     amazonPolly: HTMLInputElement,
 *     openAi: HTMLInputElement,
 *     antvaset: HTMLInputElement,
 *     unalengua: HTMLInputElement,
 *     all: HTMLInputElement,
 *     sourceName: HTMLInputElement,
 *     lastErrorValue: HTMLTextAreaElement,
 * }}
 */
const el = {
	cambridge: byId("cambridge"),
	linguee: byId("linguee"),
	oxford: byId("oxford"),
	gstatic: byId("gstatic"),
	googleSpeech: byId("googleSpeech"),
	responsiveVoice: byId("responsiveVoice"),
	unrealSpeech: byId("unrealSpeech"),
	speechify: byId("speechify"),
	playHt: byId("playHt"),
	elevenLabs: byId("elevenLabs"),
	amazonPolly: byId("amazonPolly"),
	openAi: byId("openAi"),
	antvaset: byId("antvaset"),
	unalengua: byId("unalengua"),
	all: byId("all"),
	sourceName: byId("sourceName"),
	lastErrorValue: byId("lastErrorValue"),
};

document.addEventListener("DOMContentLoaded", () => {
	showLastError("", {});
});

[
	el.cambridge,
	el.linguee,
	el.oxford,
	el.gstatic,
	el.googleSpeech,
	el.responsiveVoice,
	el.unrealSpeech,
	el.speechify,
	el.playHt,
	el.elevenLabs,
	el.amazonPolly,
	el.openAi,
	el.antvaset,
	el.unalengua,
].forEach(s => {
	s.addEventListener("click", async () => {
		const le = await sourceLastErrorTable.getValue(s.id) ?? {};
		showLastError(s.textContent, le);
		await downloadObject(le, fileName(`pronunciation-${s.id}-source-last-error.json`));
	});
});

el.all.addEventListener("click", async () => {
	try {
		const le = await sourceLastErrorTable.getAll() ?? {};
		showLastError("All", le);
		await downloadObject(le, fileName(`pronunciation-all-source-last-error.json`));
	} catch (error) {
		console.error(error);
	}
});

/**
 * @param {string} suffix
 * @returns {string}
 */
function fileName(suffix) {
	const prefix = new Date()
		.toISOString()
		.replaceAll(":", "-")
		.replaceAll(".", "-");
	return `${prefix}-${suffix}`;
}

/**
 * @param {string} sourceName
 * @param {{ [key: string]: any }} lastError
 * @returns {void}
 */
function showLastError(sourceName, lastError) {
	el.sourceName.value = sourceName;
	el.lastErrorValue.value = JSON.stringify(lastError, null, 4);
	el.lastErrorValue.select();
}
