import * as st from "../utils/storage-tables.js";
import Addon from "./addon.js";
import defaultOptions from "../utils/default-options.js";

const addon = new Addon({
	initialIpaFile: "resources/ipa.json.gz",
	defaultOptions: defaultOptions,
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

const installedCB = async (details) => addon.onInstalled(details);
const menuOnClickedCB = async (info, tab) => addon.menuOnClicked(info, tab);
const actionOnClickedCB = async (tab) => addon.actionOnClicked(tab);
const storageOnChangedCB = async (changes, area) => {
	return addon.storageOnChanged(changes, area);
};

async function main() {
	if (!browser.runtime.onInstalled.hasListener(installedCB)) {
		browser.runtime.onInstalled.addListener(installedCB);
	}
	if (!browser?.menus?.onClicked.hasListener(menuOnClickedCB)) {
		browser?.menus?.onClicked.addListener(menuOnClickedCB);
	}
	if (!browser.browserAction.onClicked.hasListener(actionOnClickedCB)) {
		browser.browserAction.onClicked.addListener(actionOnClickedCB);
	}
	if (!browser.storage.onChanged.hasListener(storageOnChangedCB)) {
		browser.storage.onChanged.addListener(storageOnChangedCB);
	}
	await addon.startup();
}

(async () => main())().catch(console.error);
