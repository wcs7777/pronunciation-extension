import { toArray, toObject } from "./utils.js";

export default class Table {
	constructor(name="table", database) {
		this.name = name;
		this.database = database;
	}

	async get(key) {
		const table = await this.getAll();
		return !Array.isArray(key) ? table[key] : key.map((k) => table[k]);
	}

	async set(key, value) {
		let table = await this.getAll();
		if (value !== undefined) {
			table[key] = value;
		} else {
			if (Array.isArray(table)) {
				table = [...table, ...toArray(key)];
			} else {
				table = { ...table, ...toObject(key) };
			}
		}
		return this.database.set(this.name, table);
	}

	async getAll() {
		return await this.database.get(this.name) || {};
	}

	async getKeys() {
		return Object.keys(await this.getAll());
	}

	async remove(key) {
		const table = await this.getAll();
		delete table[key];
		return this.database.set(this.name, table);
	}

	async removeAll() {
		return this.database.remove(this.name);
	}
}
