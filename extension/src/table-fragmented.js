import {
	alphanumeric,
	asyncReduce,
	isAlphanumeric,
	isString,
	symbolsFragment,
	toArray,
	toObject,
} from "./utils.js";

export default class TableFragmented {
	constructor(name="table", database) {
		this.name = name;
		this.database = database;
	}

	async get(key) {
		const table = await this.getAll(key2fragment(key));
		return (
			!Array.isArray(key) ?
			table[key] :
			key.reduce((obj, k) => {
				return { ...obj, [k]: table[k] };
			}, {})
		);
	}

	async set(key, value, atFragment) {
		const fragment = key2fragment(!atFragment ? key : atFragment);
		let table = await this.getAll(fragment);
		if (value !== undefined) {
			table[key] = value;
		} else {
			if (Array.isArray(table)) {
				table = [...table, ...toArray(key)];
			} else {
				table = { ...table, ...toObject(key) };
			}
		}
		return this.database.set(this.name + fragment, table);
	}

	async bulkSet(obj) {
		const fragmented = fragmentObject(obj);
		for (const [key, value] of Object.entries(fragmented)) {
			await this.set(value, undefined, key);
		}
	}

	async getAll(fragment) {
		if (fragment) {
			return await this.database.get(this.name + fragment) || {};
		} else {
			return asyncReduce(
				`${alphanumeric()}${symbolsFragment()}`.slice(""),
				{},
				async (obj, fragment) => {
					return {
						...obj,
						...await this.getAll(fragment),
					};
				},
			);
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

function fragmentObject(obj) {
	const fragmented = {};
	for (const [key, value] of Object.entries(obj)) {
		const fragment = key2fragment(key);
		if (fragmented[fragment] === undefined) {
			fragmented[fragment] = {};
		}
		fragmented[fragment][key] = value;
	}
	return fragmented;
}
