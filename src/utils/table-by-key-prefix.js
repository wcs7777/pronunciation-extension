export default class TableByKeyPrefix {

	/**
	 * @param {browser.storage.StorageArea} storage
	 * @param {string} keyPrefix
	 */
	constructor(storage, keyPrefix) {
		this.storage = storage;
		this.keyPrefix = keyPrefix;
	}

	get name() {
		return this.keyPrefix;
	}

	/**
	  * @param {string} key
	  * @param {any} key
	  * @returns {Promise<void>}
	  */
	async set(key, value) {
		return this.storage.set({ [this.fullKey(key)]: value });
	}

	/**
	  * @param {{ [key: string]: any }} values
	  * @returns {Promise<void>}
	  */
	async setMany(values) {
		const prefixed = Object
			.entries(values)
			.reduce((previous, [key, value]) => {
				previous[this.fullKey(key)] = value;
				return previous;
			}, {});
		return this.storage.set(prefixed);
	}

	/**
	  * @param {string | string[] | null} keys
	  * @param {boolean} throwNotFound
	  * @returns {Promise<{ [key: string]: any }>}
	  */
	async get(keys, throwNotFound=true) {
		const removePrefix = false;
		let values = {};
		if (keys !== null && keys != undefined) {
			values = await this.storage.get(this.fullKeys(keys));
			if (
				throwNotFound &&
				keys.length > 0 &&
				Object.keys(values).length === 0
			) {
				throw Error(`${keys} not found`);
			}
		} else {
			const allKeys = await this.getKeys(removePrefix);
			values = await this.storage.get(allKeys);
		}
		return Object.entries(values)
			.reduce((withoutKeyPrefix, [key, value]) => {
				const k = this.removeKeyPrefix(key);
				withoutKeyPrefix[k] = value;
				return withoutKeyPrefix;
			}, {});
	}

	/**
	  * @returns {Promise<number>}
	  */
	async size() {
		const removePrefix = false;
		const keys = await this.getKeys(removePrefix);
		return keys.length;
	}

	/**
	  * @param {string} key
	  * @param {boolean} throwNotFound
	  * @returns {Promise<any>}
	  */
	async getValue(key, throwNotFound=true) {
		const results = await this.get(key, throwNotFound);
		return results[key];
	}

	/**
	  * @param {string | string[] | null} keys
	  * @param {boolean} throwNotFound
	  * @returns {Promise<any[]>}
	  */
	async getValues(keys, throwNotFound) {
		return Object.values(await this.get(keys, throwNotFound));
	}

	/**
	  * @param {boolean} removePrefix
	  * @returns {Promise<{ [key: string]: any }>}
	  */
	async getAll(removePrefix=true) {
		/**
		 * @type {{ [key: string]: any }}
		 */
		const stored = await this.storage.get();
		return Object
			.entries(stored)
			.filter(([k, _]) => k.startsWith(this.keyPrefix))
			.reduce((previous, [key, value]) => {
				const k = removePrefix ? this.removeKeyPrefix(key) : key;
	 			previous[k] = value;
				return previous;
			}, {});
	}

	/**
	  * @param {boolean} removePrefix
	  * @returns {Promise<string[]>}
	  */
	async getKeys(removePrefix=true) {
		return Object.keys(await this.getAll(removePrefix));
	}

	/**
	  * @param {string | string[]} keys
	  * @returns {Promise<void>}
	  */
	async remove(keys) {
		return this.storage.remove(this.fullKeys(keys));
	}

	/**
	  * @returns {Promise<void>}
	  */
	async clear() {
		const removePrefix = false;
		const keys = await this.getKeys(removePrefix);
		return this.storage.remove(keys);
	}

	/**
	  * @param {string} key
	  * @returns {string}
	  */
	fullKey(key) {
		if (!key) {
			throw Error("key must be passed");
		}
		return `${this.keyPrefix}${key}`;
	}

	/**
	  * @param {string | string[]} keys
	  * @returns {string[]}
	  */
	fullKeys(keys) {
		const keysArray = Array.isArray(keys) ? keys : [keys];
		return keysArray.map((key) => this.fullKey(key));
	}

	/**
	  * @param {string} key
	  * @returns {string}
	  */
	removeKeyPrefix(key) {
		return key.replace(this.keyPrefix, "");
	}

}
