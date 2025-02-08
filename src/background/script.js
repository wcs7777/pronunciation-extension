import Addon from "./addon.js";

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
	const addon = new Addon(browser.storage.local);
	// await addon.initialSetup("resources/initial-ipa.json.gz");
	await addon.initialSetup("resources/short-initial-ipa.json.gz");
}

if (!browser.runtime.onInstalled.hasListener(onInstalled)) {
	browser.runtime.onInstalled.addListener(onInstalled);
}
