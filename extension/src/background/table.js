export default class Table {
	constructor(name="table", database) {
		this.name = name;
		this.database = database;
	}

	async get(key) {
		const table = await this.getAll();
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

	async set(key, value) {
		let table = await this.getAll();
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
