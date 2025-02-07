export default class TableByKeyPrefix {

	/**
	 * @param {browser.storage.StorageArea} storage
	 * @param {string} keyPrefix
	 */
	constructor(storage, keyPrefix) {
		this.storage = storage;
		this.keyPrefix = keyPrefix;
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
	  * @param {{[key: string]: any}} values
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
	  * @returns {Promise<{[key: string]: any}>}
	  */
	async get(keys) {
		let values = {};
		if (keys !== null && keys != undefined) {
			values = await this.storage.get(this.fullKeys(keys));
			if (keys.length > 0 && Object.keys(values).length === 0) {
				throw Error(`${keys} not found`);
			}
		} else {
			values = await this.storage.get(await this.getKeys(false));
		}
		return Object.entries(values)
			.reduce((withoutKeyPrefix, [key, value]) => {
				withoutKeyPrefix[key.replace(this.keyPrefix, "")] = value;
				return withoutKeyPrefix;
			}, {});
	}

	/**
	  * @param {string} key
	  * @returns {Promise<any>}
	  */
	async getValue(key) {
		const results = await this.get(key);
		return results[key];
	}

	/**
	  * @param {string | string[] | null} keys
	  * @returns {Promise<any[]>}
	  */
	async getValues(keys) {
		return Object.values(await this.get(keys));
	}

	/**
	  * @param {boolean} removePrefix
	  * @returns {Promise<{ [key: string]: any}>}
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
				const newKey = (
					removePrefix ?
					key.replace(this.keyPrefix, "") :
					key
				);
	 			previous[newKey] = value;
				return previous;
			}, {});
	}

	/**
	  * @param {boolean} removePrefix
	  * @returns {Promise<string[]>}
	  */
	async getKeys(removePrefix) {
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
		return this.storage.remove(await this.getKeys(false));
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

}
