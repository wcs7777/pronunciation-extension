export {};

declare global {
	
	type PronunciationSource = {
		static name: string,
		name: string,
		enabled: boolean,
		order: number,
		save: boolean,
		saveError: boolean,
	};

	type IpaSource = PronunciationSource & {
		constructor: (pi: PronunciationInput, options: PronunciationSourceOptions, lastError?: PronunciationSourceLastError) => IpaSource;
		fetch: () => Promise<string>,
	};

	type AudioSource = PronunciationSource & {
		constructor: (pi: PronunciationInput, options: PronunciationSourceOptions, lastError?: PronunciationSourceLastError) => AudioSource;
		fetch: () => Promise<Blob>,
	};

	type PronunciationSourceOptions = {
		enabled: boolean,
		order: number,
		enabledToText: boolean,
		orderToText: number,
		save: boolean,
		saveError: boolean,
		textMaxLength: number,
		waitRateLimitTimeout: number,
		okStatus: number[],
	};

	type PronunciationInput = {
		input: string,
		firstWord: string,
		text: string,
		words: string[],
		length: number,
		totalWords: number,
		hasWords: boolean,
		isText: boolean,
		analysis: () => Promise<WordAnalyse>,
		key: () => Promise<string>,
		raw: string,
	};

	type PronunciationSourceLastError = {
		source: string,
		datetime: Date,
		status?: number,
		timestamp: number,
		message?: string,
		messageContentType?: string,
		error: Error,
	};

	type Table = {
		name: string,
		set: (key: string, value: any) => Promise<void>,
		setMany: (values: { [key: string]: any }) => Promise<void>,
		get: (keys: string | string[] | null) => Promise<{[key: string]: any}>,
		getValue: (key: string) => Promise<any>,
		getValues: (keys: string | string[] | null) => Promise<any[]>,
		getAll: () => Promise<{ [key: string]: any }>,
		getKeys: () => Promise<string[]>,
		size: () => Promise<number>,
		remove: (keys: string | string[]) => Promise<void>,
		clear: () => Promise<void>,
	};

	type MemoryCache = {
		name: string,
		set(key: string, value: any): void,
		setMany(value: { [key: string]: any }): void,
		get(key: string); any,
		getAll(): { [key: string]: any },
		hasKey(key: string): boolean,
		size(): number,
		clear(): void,
	};

	type Options = {
		accessKey: string,
		allowText: boolean,
		alertMaxSelectionEnabled: boolean,
		alertMaxSelectionLength: number,
		ipa: OptionsIpa,
		audio: OptionsAudio,
		setPronuncationByShortcut: OptionsSetPronuncationByShortcut,
	};

	type OptionsIpa = {
		enabled: boolean,
		text: {
			enabled: boolean,
		},
		showSourceLastError: boolean,
		style: {
			font: {
				family: string,
				size: number, // px
				color: string,
			},
			backgroundColor: string,
			useContextColors: boolean,
		},
		close: {
			timeout: number,
			shortcut: string,
			onScroll: boolean,
			buttonColor: string,
			buttonHoverColor: string,
		},
		position: {
			menuTriggered: "above" | "below",
			actionTriggered: "above" | "below",
		},
		sources: {
			cambridge: OptIpaCambridge,
			oxford: OptIpaOxford,
			antvaset: OptIpaAntvaset,
			unalengua: OptIpaUnalengua,
		},
	};

	type OptIpaCambridge = PronunciationSourceOptions;
	type OptIpaOxford = PronunciationSourceOptions;
	type OptIpaAntvaset = PronunciationSourceOptions;
	type OptIpaUnalengua = PronunciationSourceOptions;

	type OptionsAudio = {
		enabled: boolean,
		text: {
			enabled: boolean,
			save: boolean,
			playerEnabled: boolean,
			shortcutsEnabled: boolean,
			skipSeconds: number,
			shortcuts: OptAudioShortcuts,
		},
		showSourceLastError: boolean,
		volume: number,
		playbackRate: number,
		limitLoudness: boolean,
		sources: {
			cambridge: OptAudioCambridge,
			linguee: OptAudioLinguee,
			oxford: OptAudioOxford,
			gstatic: OptAudioGstatic,
			googleSpeech: OptAudioGoogleSpeech,
			responsiveVoice: OptAudioResponsiveVoice,
			unrealSpeech: OptAudioUnrealSpeech,
			speechify: OptAudioSpeechify,
			playHt: OptAudioPlayHt,
			elevenLabs: OptAudioElevenLabs,
			amazonPolly: OptAudioAmazonPolly,
			openAi: OptAudioOpenAi,
			deepSeek: OptAudioDeepSeek,
		},
	};

	type OptAudioShortcuts = {
		togglePlayer: string,
		togglePlay: string,
		toggleMute: string,
		rewind: string,
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

	type OptAudioCambridge = PronunciationSourceOptions;
	type OptAudioLinguee = PronunciationSourceOptions;
	type OptAudioOxford = PronunciationSourceOptions;
	type OptAudioGstatic = PronunciationSourceOptions;

	type OptAudioGoogleSpeech = PronunciationSourceOptions;

	type OptAudioResponsiveVoice = PronunciationSourceOptions & {
		api: {
			name: string,
			key: string,
			gender: string,
		},
	};

	type OptAudioUnrealSpeech = PronunciationSourceOptions & {
		api: {
			token?: string,
			voiceId: string,
			bitRate: string,
			pitch: number,
			codec: string,
			temperature: number,
		},
	};

	type OptAudioSpeechify = PronunciationSourceOptions & {
		api: {
			token?: string,
			voiceId: string,
		},
	};

	type OptAudioPlayHt = PronunciationSourceOptions & {
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

	type OptAudioElevenLabs = PronunciationSourceOptions & {
		api: {
			key?: string,
			voiceId: string,
			outputFormat: string,
			modelId: string,
			applyTextNormalization: string,
		},
	};

	type OptAudioAmazonPolly = PronunciationSourceOptions & {
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

	type OptAudioOpenAi = PronunciationSourceOptions & {
		api: {
			key?: string,
			model: string,
			voice: string,
			responseFormat: string,
		},
	};

	type OptAudioDeepSeek = PronunciationSourceOptions & {
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

	type ClientMessage = {
		target: "client",
		type: "showIpa" | "getSelectedText" | "playAudio" | "showPopup" | "changeAlertMaxSelectionOptions",
		origin: "menuItem" | "action" | "other",
		showIpa?: {
			ipa: string,
			options: OptionsIpa,
		},
		playAudio?: {
			source?: AudioSource,
			playerEnabled: boolean,
			shortcutsEnabled: boolean,
			skipSeconds: number,
			shortcuts: OptAudioShortcuts,
		},
		showPopup?: OptionsPopup,
		changeAlertMaxSelectionOptions?: {
			enabled: boolean,
			maxLength: number,
		},
	};

	type OptionsPopup = {
		text: string,
		style: {
			font: {
				family: string,
				size: number, // px
				color: string,
			},
			backgroundColor: string,
			useContextColors: boolean,
		},
		close: {
			timeout: number,
			shortcut: string,
			onScroll: boolean,
			buttonColor: string,
			buttonHoverColor: string,
		},
		position: {
			centerHorizontally: boolean,
			centerVertically: boolean,
			top: number,
			left: number,
		},
	};

	type PlayerAudioSource = {
		id: string,
		title: string,
		url: string,
	};

	type SortableJS = {
		toArray: () => string[],
		sort: (order: string[], useAnimation: boolean) => void,
	};

	// compromise
	type WordAnalyse = {
		root: string,
		confidence: number,
		type: "Noun" | "Verb" | "Text",
		isNoun: boolean,
		isVerb: boolean,
		isValid: boolean,
		isText: boolean,
	};

}
