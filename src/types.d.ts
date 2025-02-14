export {};

declare global {
	
	type PronunciationFetcher = {
		static name: string,
		name: string,
		save: boolean,
		saveError: boolean,
		enabled: (toText: boolean) => boolean,
		order: (toText: boolean) => number,
	};

	type PronunciationFetcherOptions = {
		enabled: boolean,
		order: number,
		enabledToText: boolean,
		orderToText: number,
	};

	type IpaFetcher = PronunciationFetcher & {
		fetch: (text: string) => Promise<string>,
	};

	type AudioFetcher = PronunciationFetcher & {
		fetch: (text: string) => Promise<Blob>,
	};

	type PronunciationFetcherLastError = {
		timestamp: number,
		status?: number,
		message?: string,
		error: Error,
	};

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
		setMany(value: { [key: string]: any }): void,
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
		antvaset: OptIpaAntvaset,
		unalengua: OptIpaUnalengua,
		oxford: OptIpaOxford,
		cambridge: OptIpaCambridge,
	};

	type OptIpaAntvaset = PronunciationFetcherOptions;
	type OptIpaUnalengua = PronunciationFetcherOptions;
	type OptIpaCambridge = PronunciationFetcherOptions;
	type OptIpaOxford = PronunciationFetcherOptions;

	type OptionsAudio = {
		enabled: boolean,
		volume: number,
		playbackRate: number,
		realVoice: OptAudioRealVoice,
		googleSpeech: OptAudioGoogleSpeech,
		responsiveVoice: OptAudioResponsiveVoice,
	};

	type OptAudioRealVoice = PronunciationFetcherOptions & {
		fetchTimeout: number,
	};

	type OptAudioGoogleSpeech = PronunciationFetcherOptions & {
		save: boolean,
	};

	type OptAudioResponsiveVoice = PronunciationFetcherOptions & {
		api: {
			name: string,
			key: string,
			gender: string,
		},
	};

	type OptionsSetPronuncationByShortcut = {
		enabled: boolean,
		audioShortcut: string,
		ipaShortcut: string,
		restoreDefaultIpaShortcut: string,
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
