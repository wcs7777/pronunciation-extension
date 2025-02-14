/**
 * @type {Options}
 */
const defaultOptions = {
	accessKey: "P",
	allowMultipleWords: true,
	ipa: {
		enabled: true,
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
			orderToText: 1,
		},
		unalengua: {
			enabled: true,
			order: 2,
			enabledToText: true,
			orderToText: 1,
		},
		oxford: {
			enabled: true,
			order: 3,
			enabledToText: false,
			orderToText: 0,
		},
		cambridge: {
			enabled: true,
			order: 4,
			enabledToText: false,
			orderToText: 0,
		},
	},
	audio: {
		enabled: true,
		volume: 1.0,
		playbackRate: 1.0,
		realVoice: {
			enabled: true,
			order: 1,
			enabledToText: false,
			orderToText: 0,
			fetchTimeout: 3000,
		},
		googleSpeech: {
			enabled: true,
			order: 4,
			enabledToText: true,
			orderToText: 1,
			save: false,
		},
		responsiveVoice: {
			enabled: true,
			order: 3,
			enabledToText: true,
			orderToText: 2,
			api: {
				name: "rjs",
				key: "O8Ic880z",
				gender: "male",
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
