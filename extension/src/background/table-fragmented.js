import { alphanumeric, isAlphanumeric, isString, symbolsFragment } from "../utils.js";

export default class TableFragmented {
	constructor(name="table", database) {
		this.name = name;
		this.database = database;
	}

	async get(key) {
		const table = await this.getAll(key2fragment(key));
		if (!Array.isArray(key)) {
			return table[key];
		} else {
			const values = [];
			for (const k of key) {
				values.push(table[k]);
			}
			return values;
		}
	}

	async set(key, value, atFragment) {
		const fragment = key2fragment(!atFragment ? key : atFragment);
		let table = await this.getAll(fragment);
		if (value !== undefined) {
			table[key] = value;
		} else {
			if (Array.isArray(table)) {
				if (Array.isArray(key)) {
					table = [...table, ...key];
				} else {
					table = [...table, key];
				}
			} else {
				if (typeof key === "object") {
					table = { ...table, ...key };
				} else {
					table = { ...table, [key]: key };
				}
			}
		}
		return this.database.set(this.name + fragment, table);
	}

	async getAll(fragment) {
		if (fragment) {
			return await this.database.get(this.name + fragment) || {};
		} else {
			let table = {};
			for (const fragment of alphanumeric() + symbolsFragment()) {
				const tableFragment = await this.getAll(fragment);
				table = { ...table, ...tableFragment };
			}
			return table;
		}
	}

	async getKeys() {
		return Object.keys(await this.getAll());
	}

	async remove(key) {
		const fragment = key2fragment(key);
		const table = await this.getAll(fragment);
		delete table[key];
		return this.database.set(this.name + fragment, table);
	}
}

function key2fragment(key) {
	const value = (
		isString(key)? key :
		Array.isArray(key) ? key[0] :
		Object.keys(key)[0]
	);
	return isAlphanumeric(value[0]) ? value[0] : symbolsFragment();
}
