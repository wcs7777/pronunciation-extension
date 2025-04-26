import { byId } from "../../utils/element.js";
import { showInfo } from "./utils.js";
import {
	audioTable,
	audioTextTable,
	errorsTable,
	ipaTable,
} from "../../utils/storage-tables.js";

/**
 * @type {{
 *     ipa: HTMLButtonElement,
 *     audio: HTMLButtonElement,
 *     audioText: HTMLButtonElement,
 *     errors: HTMLButtonElement,
 * }}
 */
const el = {
	ipa: byId("ipa"),
	audio: byId("audio"),
	audioText: byId("audioText"),
	errors: byId("errors"),
};

el.ipa.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear IPA storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await ipaTable.clear();
		showInfo(currentTarget, "IPA storage cleared");
	} catch (error) {
		console.error(error);
	}
});

el.audio.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear audio storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await audioTable.clear();
		showInfo(currentTarget, "Audio storage cleared");
	} catch (error) {
		console.error(error);
	}
});

el.audioText.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear audio text storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await audioTextTable.clear();
		showInfo(currentTarget, "Audio text storage cleared");
	} catch (error) {
		console.error(error);
	}
});

el.errors.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to clear errors storage?";
		if (!window.confirm(msg)) {
			return;
		}
		await errorsTable.clear();
		showInfo(currentTarget, "Errors storage cleared");
	} catch (error) {
		console.error(error);
	}
});
