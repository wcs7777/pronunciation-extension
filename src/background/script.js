import Addon from "./addon.js";

async function main() {
	console.clear();
	await browser.storage.local.clear();
	console.log(await browser.storage.local.get());
	const addon = new Addon(browser.storage.local);
	// await addon.setup("resources/initial-ipa.json.gz");
	await addon.initialSetup("resources/short-initial-ipa.json.gz");
	// console.log("audioTable", await addon.audioTable.getAll());
	// console.log("audioCache", addon.audioCache.getAll());
	// console.log("ipaTable", await addon.ipaTable.getValue("vulture"));
	// console.log("ipaCache", addon.ipaCache.getAll());
	// console.log("defaultIpaTable", await addon.defaultIpaTable.getAll());
	// console.log("optionsTable", await addon.optionsTable.getAll());
	// console.log("optionsCache", addon.optionsCache.getAll());
	// console.log("defaultOptionsTable", await addon.defaultOptionsTable.getAll());
	// console.log("controlTable", await addon.controlTable.getAll());
	// console.log("errorsTable", await addon.errorsTable.getAll());
}

(async() => main())().catch(console.error);
