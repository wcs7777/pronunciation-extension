import * as st from "../utils/storage-tables.js";
import Addon from "./addon.js";
import defaultOptions from "../utils/default-options.js";

/**
 * @param {browser.runtime._OnInstalledDetails} details
 * @returns {Promise<void>}
 */
async function onInstalled(details) {
	console.clear();
	if (details.reason === "update") {
		if (parseInt(details.previousVersion) < 3) { // break change
			console.log("cleaning storage due to update break change");
			await browser.storage.local.clear();
		}
	}
	if (details.temporary) {
		console.log("cleaning storage due to temporary installation");
		await browser.storage.local.clear();
	}
	const addon = new Addon({
		audioTable: st.audioTable,
		audioCache: st.audioCache,
		ipaTable: st.ipaTable,
		ipaCache: st.ipaCache,
		defaultIpaTable: st.defaultIpaTable,
		optionsTable: st.optionsTable,
		optionsCache: st.optionsCache,
		defaultOptionsTable: st.defaultOptionsTable,
		controlTable: st.controlTable,
		errorsTable: st.errorsTable,
		audioTextCache: st.audioTextCache,
		ipaTextCache: st.ipaTextCache,
	});
	// const ipaFile = "resources/initial-ipa.json.gz";
	const ipaFile = "resources/short-initial-ipa.json.gz";
	await addon.initialSetup(ipaFile, defaultOptions);
}

if (!browser.runtime.onInstalled.hasListener(onInstalled)) {
	browser.runtime.onInstalled.addListener(onInstalled);
}
