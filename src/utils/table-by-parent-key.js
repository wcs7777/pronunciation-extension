/**
 * @implements {Table}
 */
export default class TableByKeyPrefix {

	/**
	 * @param {browser.storage.StorageArea} storage
	 * @param {string} parentkey
	 */
	constructor(storage, parentkey) {
		this.storage = storage;
		this.parentKey = parentkey;
	}

	get name() {
		return this.parentKey;
	}

	/**
	  * @param {string} key
	  * @param {any} key
	  * @returns {Promise<void>}
	  */
	async set(key, value) {
		const results = await this.getAll();
		results[key] = value;
		return this.storage.set({ [this.parentKey]: results });
	}

	/**
	  * @param {{ [key: string]: any }} values
	  * @returns {Promise<void>}
	  */
	async setMany(values) {
		const results = await this.getAll();
		return this.storage.set({
			[this.parentKey]: {...results, ...values },
		});
	}

	/**
	  * @param {string | string[] | null} keys
	  * @returns {Promise<{ [key: string]: any }>}
	  */
	async get(keys) {
		const results = await this.getAll();
		if (keys !== null && keys !== undefined) {
			const keysArray = Array.isArray(keys) ? keys : [keys];
			return keysArray.reduce((filtered, key) => {
				if (key in results) {
					filtered[key] = results[key];
				}
				return filtered;
			}, {});
	 	} else {
			return results;
		}
	}

	/**
	  * @param {string} key
	  * @returns {Promise<any>}
	  */
	async getValue(key) {
		const result = await this.get(key);
		return result[key];
	}

	/**
	  * @param {string | string[] | null} keys
	  * @returns {Promise<any[]>}
	  */
	async getValues(keys) {
		return Object.values(await this.get(keys));
	}

	/**
	  * @returns {Promise<{ [key: string]: any }>}
	  */
	async getAll() {
		const results = await this.storage.get(this.parentKey);
		return this.parentKey in results ? results[this.parentKey] : {};
	}

	/**
	  * @returns {Promise<string[]>}
	  */
	async getKeys() {
		return Object.keys(await this.getAll());
	}

	/**
	  * @returns {Promise<number>}
	  */
	async size() {
		const keys = await this.getKeys();
		return keys.length;
	}

	/**
	  * @param {string | string[]} keys
	  * @returns {Promise<void>}
	  */
	async remove(keys) {
		const results = await this.getAll();
		const keysArray = Array.isArray(keys) ? keys : [keys];
		const values = Object.entries(results)
			.reduce((filtered, [key, value]) => {
				if (!keysArray.includes(key)) {
					filtered[key] = value;
				}
				return filtered;
			}, {});
		return this.storage.set({ [this.parentKey]: values });
	}

	/**
	  * @returns {Promise<void>}
	  */
	async clear() {
		return this.storage.remove(this.parentKey);
	}

}
