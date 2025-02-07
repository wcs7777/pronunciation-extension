export default class MemoryCache {

	constructor() {
		this.entries = {};
	}

	/**
	 * @param {string} key
	 * @param {any} value
	 * @returns {void}
	 */
	set(key, value) {
		this.entries[key] = value;
	}

	/**
	 * @param {string} key
	 * @returns {any}
	 */
	get(key) {
		if (!this.hasKey(key)) {
			throw new Error(`${key} not in cache`);
		}
		return this.entries[key];
	}

	/**
	 * @param {string} key
	 * @returns {boolean}
	 */
	hasKey(key) {
		return key in this.entries;
	}

	/**
	 * @returns {void}
	 */
	clear() {
		this.entries = {};
	}

}
