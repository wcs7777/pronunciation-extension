/**
 * @type {Options}
 */
const defaultOptions = {
	accessKey: "P",
	allowText: true,
	ipa: {
		enabled: true,
		enabledToText: true,
		font: {
			family: "'Lucida Sans Unicode', 'Segoe UI'",
			size: 18, // px
			color: "#282828",
			backgroundColor: "#FFFFFF",
		},
		close: {
			timeout: 3000,
			shortcut: "\\",
			onScroll: false,
		},
		position: {
			menuTriggered: "above",
			actionTriggered: "below",
		},
		useContextColors: false,
		antvaset: {
			enabled: true,
			order: 1,
			enabledToText: false,
			orderToText: 0,
			save: true,
			saveError: true,
			textMaxLength: 0,
		},
		unalengua: {
			enabled: true,
			order: 2,
			enabledToText: true,
			orderToText: 1,
			save: true,
			saveError: true,
			textMaxLength: 1500,
		},
		oxford: {
			enabled: true,
			order: 3,
			enabledToText: false,
			orderToText: 0,
			save: true,
			saveError: true,
			textMaxLength: 0,
		},
		cambridge: {
			enabled: true,
			order: 4,
			enabledToText: false,
			orderToText: 0,
			save: true,
			saveError: true,
			textMaxLength: 0,
		},
	},
	audio: {
		enabled: true,
		enabledToText: true,
		volume: 1.0,
		playbackRate: 1.0,
		realVoice: {
			enabled: true,
			order: 1,
			enabledToText: false,
			orderToText: 0,
			save: true,
			saveError: true,
			textMaxLength: 0,
			fetchTimeout: 3000,
		},
		googleSpeech: {
			enabled: true,
			order: 3,
			enabledToText: true,
			orderToText: 2,
			save: false,
			saveError: true,
			textMaxLength: 50000,
		},
		responsiveVoice: {
			enabled: true,
			order: 2,
			enabledToText: true,
			orderToText: 1,
			save: true,
			saveError: true,
			textMaxLength: 2000,
			api: {
				name: "rjs",
				key: "O8Ic880z",
				gender: "male",
			},
		},
		unrealSpeech: {
			enabled: true,
			order: 4,
			enabledToText: true,
			orderToText: 3,
			save: true,
			saveError: true,
			textMaxLength: 1000, // stream endpoint
			api: {
				token: null,
				voiceId: "Scarlett",
				bitRate: "192k",
				pitch: 1,
				codec: "libmp3lame",
				temperature: 0.25,
			},
		},
	},
	setPronuncationByShortcut: {
		enabled: false,
		audioShortcut: "A",
		ipaShortcut: "Z",
		restoreDefaultIpaShortcut: "X",
	},
};

export default defaultOptions;
