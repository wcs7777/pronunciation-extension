import Table from "./table.js";
import {
	alphanumeric,
	asyncReduce,
	isAlphanumeric,
	isString,
	symbolsFragment,
	toArray
} from "./utils.js";

export default class TableFragmented {
	constructor(name="table", database) {
		this.name = name;
		this.database = database;
		this.tables = allFragmentsInArray()
			.reduce((tables, fragment) => {
				return {
					...tables,
					[fragment]: new Table(`${fragment}${this.name}`, database),
				};
			}, {});
	}

	async get(key) {
		return this.tables[key2fragment(key)].get(key);
	}

	async set(key, value, atFragment) {
		const fragment = key2fragment(!atFragment ? key : atFragment);
		return this.tables[fragment].set(key, value);
	}

	async bulkSet(obj) {
		const fragmented = fragmentObject(obj);
		for (const [key, value] of Object.entries(fragmented)) {
			await this.set(value, undefined, key);
		}
	}

	async getAll(fragment) {
		if (fragment) {
			return this.tables[fragment].getAll();
		} else {
			return asyncReduce(
				allFragmentsInArray(),
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

	async remove(keys) {
		const fragmented = toArray(keys).reduce((sorted, key) => {
			const fragment = key2fragment(key);
			if (sorted[fragment] === undefined) {
				sorted[fragment] = [];
			}
			sorted[fragment].push(key);
			return sorted;
		}, {});
		for (const [fragment, sortedKeys] of Object.entries(fragmented)) {
			await this.tables[fragment].remove(sortedKeys);
		}
	}
}

function allFragmentsInArray() {
	return `${alphanumeric()}${symbolsFragment()}`.split("");
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
