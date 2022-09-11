import { isString } from "./utils.js";

export default {
	async set(key, value) {
		const keys = value !== undefined ? { [key]: value } : key;
		return browser.storage.local.set(keys);
	},

	async get(key) {
		const result = await browser.storage.local.get(key);
		return isString(key) ? result[key] : result;
	},

	async remove(keys) {
		return browser.storage.local.remove(keys);
	},

	async getAll() {
		return browser.storage.local.get();
	},
};
