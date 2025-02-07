export {};

declare global {
	
	type Table = {
		async set(key: string, value: any): Promise<void>,
		async setMany(values: { [key: string]: any }): Promise<void>,
		async get(keys: string | string[] | null, throwNotFound: boolean): Promise<{[key: string]: any}>,
		async getValue(key: string, throwNotFound: boolean): Promise<any>,
		async getValues(keys: string | string[] | null, throwNotFound: boolean): Promise<any[]>,
		async getAll(): Promise<{ [key: string]: any }>,
		async getKeys(): Promise<string[]>,
		async remove(keys: string | string[]): Promise<void>,
		async clear(): Promise<void>,
	};

	type MemoryCache = {
		set(key: string, value: any): void,
		get(key: string, throwNotFound: boolean); any,
		getAll(): { [key: string]: any },
		hasKey(key: string): boolean,
		clear(): void,
	};

	type ResponsiveVoiceOptions = {
		name?: string,
		key?: string,
		gender?: string,
	};

	type Options = {
		accessKey: string,
		ignoreMultipleWords: boolean,
		ipa: OptionsIpa,
		audio: OptionsAudio,
		setPronuncationByShortcut: OptionsSetPronuncationByShortcut,
	};

	type OptionsIpa = {
		enabled: boolean,
		closeTimeout: number,
		fontFamily: string,
		fontSizePx: number,
		closeShortcut: string,
		closeOnScroll: boolean,
		useContextColors: boolean,
		positionMenuTriggered: string,
		positionActionTriggered: string,
	};

	type OptionsAudio = {
		enabled: boolean,
		volume: number,
		playbackRate: number,
		fetchFileTimeout: number,
		fetchScrapTimeout: number,
	};

	type OptionsSetPronuncationByShortcut = {
		audioShortcut: string,
		ipaShortcut: string,
		restoreDefaultIpaShortcut: string,
	};

}
