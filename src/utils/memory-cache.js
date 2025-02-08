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
	 * @param {{ [key: string]: any }} values
	 * @returns {void}
	 */
	setMany(values) {
		this.entries = { ...this.entries, ...values };
	}

	/**
	 * @param {string} key
	 * @param {boolean} throwNotFound
	 * @returns {any}
	 */
	get(key, throwNotFound=true) {
		if (throwNotFound && !this.hasKey(key)) {
			throw new Error(`${key} not in cache`);
		}
		return this.entries[key];
	}

	/**
	 * @returns {{ [key: string]: any }}
	 */
	getAll() {
		return {...this.entries};
	}

	/**
	 * @param {string} key
	 * @returns {boolean}
	 */
	hasKey(key) {
		return key in this.entries;
	}

	/**
	 * @returns {number}
	 */
	size() {
		return Object.keys(this.entries).length;
	}

	/**
	 * @returns {void}
	 */
	clear() {
		this.entries = {};
	}

}
