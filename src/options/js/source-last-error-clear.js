import { byId } from "../../utils/element.js";
import { showInfo } from "./utils.js";
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
 *     deepSeek: HTMLInputElement,
 *     translatorMind: HTMLInputElement,
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
	deepSeek: byId("deepSeek"),
	translatorMind: byId("translatorMind"),
	unalengua: byId("unalengua"),
	all: byId("all"),
};

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
	el.deepSeek,
	el.translatorMind,
	el.unalengua,
].forEach(s => {
	s.addEventListener("click", async () => {
		try {
			const msg = `Are you sure to clear ${s.textContent} source last error storage?`;
			if (!window.confirm(msg)) {
				return;
			}
			await sourceLastErrorTable.remove(s.id);
			showInfo(`${s.textContent} source last error storage cleared`);
		} catch (error) {
			console.error(error);
		}
	});
});

el.all.addEventListener("click", async () => {
	try {
		const msg = "Are you sure to clear all last error storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await sourceLastErrorTable.clear();
		showInfo("All last erro storage cleared");
	} catch (error) {
		console.error(error);
	}
});
