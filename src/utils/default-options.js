/**
 * @type {Options}
 */
const defaultOptions = {
	// accessKey: "P",
	accessKey: "Y",
	allowMultipleWords: true,
	// allowMultipleWords: false,
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
			onScroll: true,
		},
		position: {
			menuTriggered: "above",
			actionTriggered: "below",
		},
		useContextColors: false,
	},
	audio: {
		enabled: true,
		volume: 1.0,
		playbackRate: 1.0,
		fetchFileTimeout: 3000,
		responseVoice: {
			name: "rjs",
			key: "O8Ic880z",
			gender: "male",
		},
	},
	setPronuncationByShortcut: {
		enabled: true,
		audioShortcut: "A",
		ipaShortcut: "Z",
		restoreDefaultIpaShortcut: "X",
	},
};

export default defaultOptions;
