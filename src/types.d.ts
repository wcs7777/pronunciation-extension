export {};

declare global {
	
	type Table = {
		async set(key: string, value: any): Promise<void>,
		async setMany(values: {[key: string]: any}): Promise<void>,
		async get(keys: string | string[] | null): Promise<{[key: string]: any}>,
		async getValue(key: string): Promise<any>,
		async getValues(keys: string | string[] | null): Promise<any[]>,
		async getAll(): Promise<{ [key: string]: any}>,
		async getKeys(): Promise<string[]>,
		async remove(keys: string | string[]): Promise<void>,
		async clear(): Promise<void>,
	};

	type MemoryCache = {
		set(key: string, value: any): void,
		get(key: string); any,
		hasKey(key: string): boolean,
		clear(): void,
	};

	type ResponsiveVoiceOptions = {
		name?: string,
		key?: string,
		gender?: string,
	};

}
