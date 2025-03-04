export {};

declare global {
	
	type PronunciationFetcher = {
		static name: string,
		name: string,
		enabled: (input: string, toText: boolean) => boolean,
		order: (toText: boolean) => number,
		save: boolean,
		saveError: boolean,
	};

	type PronunciationFetcherOptions = {
		enabled: boolean,
		order: number,
		enabledToText: boolean,
		orderToText: number,
		save: boolean,
		saveError: boolean,
		textMaxLength: number,
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
		allowText: boolean,
		ipa: OptionsIpa,
		audio: OptionsAudio,
		setPronuncationByShortcut: OptionsSetPronuncationByShortcut,
	};

	type OptionsIpa = {
		enabled: boolean,
		enabledToText: boolean,
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
		enabledToText: boolean,
		playerEnabledToText: boolean,
		shortcutsEnabledToText: boolean,
		volume: number,
		playbackRate: number,
		shortcuts: OptAudioShortcuts,
		realVoice: OptAudioRealVoice,
		googleSpeech: OptAudioGoogleSpeech,
		responsiveVoice: OptAudioResponsiveVoice,
		unrealSpeech: OptAudioUnrealSpeech,
		speechify: OptAudioSpeechify,
		playHt: OptAudioPlayHt,
		elevenLabs: OptAudioElevenLabs,
		amazonPolly: OptAudioAmazonPolly,
		openAi: OptAudioOpenAi,
	};

	type OptAudioShortcuts = {
		togglePlayer: string,
		togglePlay: string,
		toggleMute: string,
		previous: string,
		next: string,
		backward: string,
		forward: string,
		decreaseVolume: string,
		increaseVolume: string,
		decreaseSpeed: string,
		increaseSpeed: string,
		resetSpeed: string,
	};

	type OptAudioRealVoice = PronunciationFetcherOptions & {
		fetchTimeout: number,
	};

	type OptAudioGoogleSpeech = PronunciationFetcherOptions;

	type OptAudioResponsiveVoice = PronunciationFetcherOptions & {
		api: {
			name: string,
			key: string,
			gender: string,
		},
	};

	type OptAudioUnrealSpeech = PronunciationFetcherOptions & {
		api: {
			token?: string,
			voiceId: string,
			bitRate: string,
			pitch: number,
			codec: string,
			temperature: number,
		},
	};

	type OptAudioSpeechify = PronunciationFetcherOptions & {
		api: {
			token?: string,
			voiceId: string,
		},
	};

	type OptAudioPlayHt = PronunciationFetcherOptions & {
		api: {
			userId?: string,
			key?: string,
			voiceId: string,
			quality: string,
			outputFormat: string,
			sampleRate: number,
			temperature: number | null,
			voiceEngine: string,
		},
	};

	type OptAudioElevenLabs = PronunciationFetcherOptions & {
		api: {
			key?: string,
			voiceId: string,
			outputFormat: string,
			modelId: string,
			applyTextNormalization: string,
		},
	};

	type OptAudioAmazonPolly = PronunciationFetcherOptions & {
		api: {
			accessKeyId?: string,
			secretAccessKey?: string,
			endpoint: string,
			engine: string,
			outputFormat: string,
			sampleRate: string,
			voiceId: string,
		},
	};

	type OptAudioOpenAi = PronunciationFetcherOptions & {
		api: {
			key?: string,
			model: string,
			voice: string,
			responseFormat: string,
		},
	};

	type OptionsSetPronuncationByShortcut = {
		enabled: boolean,
		audioShortcut: string,
		ipaShortcut: string,
		restoreDefaultIpaShortcut: string,
	};

	type BackgroundMessage = {
		type: "showIpa" | "getSelectedText" | "playAudio",
		origin: "menuItem" | "action" | "other",
		showIpa?: {
			ipa: string,
			options: OptionsIpa,
		},
		playAudio?: {
			source?: AudioSource,
			playerEnabled: boolean,
			shortcutsEnabled: boolean,
			shortcuts: OptAudioShortcuts,
		},
	};

	type OptionsPopup = {
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
			buttonColor: string,
			buttonHoverColor: string,
		},
		position: {
			top: number,
			left: number,
		},
	};

	type AudioSource = {
		id: string,
		title: string,
		url: string,
	};

	type SortableJS = {
		toArray: () => string[],
		sort: (order: string[], useAnimation: boolean) => void,
	};

}
