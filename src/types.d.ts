export {};

declare global {
	
	type Table = {
		name: string,
		async set(key: string, value: any): Promise<void>,
		async setMany(values: { [key: string]: any }): Promise<void>,
		async get(keys: string | string[] | null, throwNotFound: boolean): Promise<{[key: string]: any}>,
		async getValue(key: string, throwNotFound: boolean): Promise<any>,
		async getValues(keys: string | string[] | null, throwNotFound: boolean): Promise<any[]>,
		async getAll(): Promise<{ [key: string]: any }>,
		async getKeys(): Promise<string[]>,
		async size(): Promise<number>,
		async remove(keys: string | string[]): Promise<void>,
		async clear(): Promise<void>,
	};

	type MemoryCache = {
		name: string,
		set(key: string, value: any): void,
		get(key: string, throwNotFound: boolean); any,
		getAll(): { [key: string]: any },
		hasKey(key: string): boolean,
		size(): number,
		clear(): void,
	};

	type Options = {
		accessKey: string,
		allowMultipleWords: boolean,
		ipa: OptionsIpa,
		audio: OptionsAudio,
		setPronuncationByShortcut: OptionsSetPronuncationByShortcut,
	};

	type OptionsIpa = {
		enabled: boolean,
		font: {
			family: string,
			size: number, // px
			color: string,
			backgroundColor: string,
		},
		close: {
			timeout: number,
			shortcut: string,
			onScroll: boolean,
		},
		position: {
			menuTriggered: "above" | "below",
			actionTriggered: "above" | "below",
		},
		useContextColors: boolean,
	};

	type OptionsAudio = {
		enabled: boolean,
		volume: number,
		playbackRate: number,
		fetchFileTimeout: number,
		responseVoice: OptionsResponsiveVoice,
	};

	type OptionsSetPronuncationByShortcut = {
		enabled: boolean,
		audioShortcut: string,
		ipaShortcut: string,
		restoreDefaultIpaShortcut: string,
	};

	type OptionsResponsiveVoice = {
		name: string,
		key: string,
		gender: string,
	};

	type BackgroundMessage = {
		type: "showIpa" | "getSelectedText",
		origin: "menuItem" | "action" | "other",
		showIpa?: {
			ipa: string,
			options: OptionsIpa,
		},
	};

	type OptionsPopup = {
		target: HTMLElement | Node,
		text: string,
		font: {
			family: string,
			size: number, // px
			color: string,
			backgroundColor: string,
		},
		close: {
			timeout: number,
			shortcut: string,
			onScroll: boolean,
		},
		position: {
			top: number,
			left: number,
		},
	};

}
