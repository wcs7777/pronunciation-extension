export default class MemoryCache {

	/**
	 * @param {string} name
	 * @param {number} maxSize
	 */
	constructor(name, maxSize) {
		this.name = name;
		this.maxSize = maxSize;
		this.entries = {};
	}

	/**
	 * @param {string} key
	 * @param {any} value
	 * @returns {void}
	 */
	set(key, value) {
		if (this.size() > this.maxSize) {
			this.clear();
		}
		this.entries[key] = value;
	}

	/**
	 * @param {{ [key: string]: any }} values
	 * @returns {void}
	 */
	setMany(values) {
		const newValues = { ...this.entries, ...values };
		const keys = Object.keys(newValues).slice(-this.maxSize);
		const entries = keys.reduce((obj, k)  => {
			obj[k] = newValues[k];
			return obj;
		}, {});
		console.log({ keys });
		console.log({ entries });
		this.entries = entries;
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
		return structuredClone(this.entries);
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
