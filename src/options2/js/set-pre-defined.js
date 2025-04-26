import "../../utils/fflate.js";
import { byId } from "../../utils/element.js";
import { defaultIpaTable, ipaTable } from "../../utils/mock-storage-tables.js";
import { showInfo } from "./utils.js";

/**
 * @type {{
 *     ipaShort: HTMLButtonElement,
 *     ipaLong: HTMLButtonElement,
 * }}
 */
const el = {
	ipaShort: byId("ipaShort"),
	ipaLong: byId("ipaLong"),
};

el.ipaShort.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to set short pre-defined IPA definitions (some definitions may be overrode and may take some time)?";
		if (!window.confirm(msg)) {
			return;
		}
		// const url = browser.runtime.getURL("resources/ipa-short.json.gz");
		const url = "../resources/ipa-short.json.gz";
		const response = await fetch(url);
		const gzipBuffer = new Uint8Array(await response.arrayBuffer());
		const ipaBuffer = fflate.decompressSync(gzipBuffer);
		const ipaDecoded = new TextDecoder().decode(ipaBuffer);
		const values = JSON.parse(ipaDecoded);
		console.log("Storing parsed gzip");
		await Promise.all([
			ipaTable.setMany(values),
			defaultIpaTable.setMany(values),
		]);
		showInfo(currentTarget, "Complete short pre-defined IPA definitions set");
	} catch (error) {
		console.error(error);
	}
});

el.ipaLong.addEventListener("click", async ({ currentTarget }) => {
	try {
		const msg = "Are you sure to set long pre-defined IPA definitions (some definitions may be overrode and may take some time)?";
		if (!window.confirm(msg)) {
			return;
		}
		// const url = browser.runtime.getURL("resources/ipa-long.json.gz");
		const url = "../resources/ipa-long.json.gz";
		const response = await fetch(url);
		const gzipBuffer = new Uint8Array(await response.arrayBuffer());
		const ipaBuffer = fflate.decompressSync(gzipBuffer);
		const ipaDecoded = new TextDecoder().decode(ipaBuffer);
		const values = JSON.parse(ipaDecoded);
		console.log("Storing parsed gzip");
		await Promise.all([
			ipaTable.setMany(values),
			defaultIpaTable.setMany(values),
		]);
		showInfo(currentTarget, "Complete long pre-defined IPA definitions set");
	} catch (error) {
		console.error(error);
	}
});
