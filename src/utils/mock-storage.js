/**
 * @implements {browser.storage.StorageArea}
 */
export default class MockStorage {
	
	/**
	 * @param {{ [key: string]: initialStorage }} storage
	 */
	constructor(storage={}) {
		this.storage = storage;
	}

	/**
	 * Gets one or more items from storage.
	 * @param {null | string | string[] | { [key: string]: any }} keys - A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in `null` to get the entire contents of storage.
     * @returns {Promise<{ [key: string]: any }>}
	 */
	async get(keys) {
		let values = {};
		if (keys !== undefined && keys !== null) {
			if (Array.isArray(keys)) {
				values = keys.reduce((obj, key) => {
					if (key in this.storage) {
						obj[key] = this.storage[key];
					}
					return obj;
				}, {});
			} else if (typeof keys === "string") {
				if (keys in this.storage) {
					values = {[keys]: this.storage[keys]};
				}
			} else if (typeof keys === "object") {
				values = await this.get(Object.keys(keys));
				values = {...this.storage, ...values};
			}
		} else {
			values = this.storage;
		}
		return structuredClone(values);
	}

	/**
	 * Sets multiple items.
	 * @param {{ [key: string]: any }} items - An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
	 * @returns {Promise<void>}
	 *
	 * Primitive values such as numbers will serialize as expected. Values with a `typeof` `"object"` and `"function"` will typically serialize to `{}`, with the exception of `Array` (serializes as expected), `Date`, and `Regex` (serialize using their `String` representation).
	 */
	async set(items) {
		this.storage = {
			...this.storage,
			...items,
		};
	}

	/**
	 * Removes one or more items from storage.
	 * @param {string | string[]} keys - A single key or a list of keys for items to remove.
	 * @returns {Promise<void>}
	 */
	async remove(keys) {
		if (Array.isArray(keys)) {
			for (const key in keys) {
				delete this.storage[key];
			}
		} else if (typeof string === "string") {
			delete this.storage[keys];
		}
	}

	/**
	 * Removes all items from storage.
	 * @returns {Promise<void>}
	 */
	async clear() {
		this.storage = {};
	}

}
