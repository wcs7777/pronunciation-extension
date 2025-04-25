/**
 * @param {string} mainPage
 * @param {?string} subPage
 * @returns {void}
 */
export function createNavCB(mainPage, subPage=null) {
	document.addEventListener("DOMContentLoaded", () => {
		createNav(mainPage, subPage);
	});
}

/**
 * @param {string} mainPage
 * @param {?string} subPage
 * @returns {void}
 */
export function createNav(mainPage, subPage=null) {
	/**
		* @type {{
		*     [key: string]: {
		*         label: string,
		*         subPages: { [key: string]: { label: string } }
		*     },
		* }},
	 */
	const pages = {
		"./general.html": {
			label: "General",
			subPages: {},
		},
		"./ipa-general.html": {
			label: "IPA",
			subPages: {
				"./ipa-general.html": {
					label: "General"
				},
				"./ipa-style.html": {
					label: "Style",
				},
				"./ipa-position.html": {
					label: "Position",
				},
				"./ipa-close.html": {
					label: "Close",
				},
				"./ipa-sources-order.html": {
					label: "Sources Order",
				},
				"./ipa-sources-order-to-text.html": {
					label: "Sources Order to Text",
				},
			},
		},
		"./audio-general.html": {
			label: "Audio",
			subPages: {
				"./audio-general.html": {
					label: "General",
				},
				"./audio-text.html": {
					label: "Text",
				},
				"./audio-sources-order.html": {
					label: "Sources Order",
				},
				"./audio-sources-order-to-text.html": {
					label: "Sources Order to Text",
				},
				"./audio-responsivevoice.html": {
					label: "ResponsiveVoice",
				},
				"./audio-unrealspeech.html": {
					label: "UnrealSpeech",
				},
				"./audio-speechify.html": {
					label: "Speechify",
				},
				"./audio-playht.html": {
					label: "PlayHT",
				},
				"./audio-elevenlabs.html": {
					label: "ElevenLabs",
				},
				"./audio-amazonpolly.html": {
					label: "Amazon Polly",
				},
				"./audio-openai.html": {
					label: "OpenAI",
				},
			},
		},
		"./set-from-sites.html": {
			label: "Set From Sites",
			subPages: {},
		},
		"./set-custom.html": {
			label: "Set Custom",
			subPages: {},
		},
		"./remove.html": {
			label: "Remove",
			subPages: {},
		},
		"./download-storage.html": {
			label: "Download Storage",
			subPages: {},
		},
		"./update-storage.html": {
			label: "Update Storage",
			subPages: {},
		},
		"./clear-storage.html": {
			label: "Clear Storage",
			subPages: {},
		},
		"./set-pre-defined.html": {
			label: "Set Pre-Defined",
			subPages: {},
		},
		"./restore-default.html": {
			label: "Restore Default",
			subPages: {},
		},
	};
	if (!(mainPage in pages)) {
		throw new Error(`Invalid mainPage: ${mainPage}`);
	}
	if (subPage && !(subPage in pages[mainPage].subPages)) {
		throw new Error(`Invalid subPage of ${mainPage}: ${subPage}`);
	}
	const header = document.querySelector("header");
	const mainNav = document.createElement("nav");
	header.appendChild(mainNav);
	mainNav.classList.add("options-container");
	for (const [href, data] of Object.entries(pages)) {
		const anchor = document.createElement("a");
		mainNav.appendChild(anchor);
		anchor.classList.add("option");
		anchor.href = href;
		anchor.textContent = data.label;
		if (href !== mainPage) {
			anchor.dataset.optionCurrent = "no";
		} else {
			anchor.dataset.optionCurrent = "yes";
			if (subPage) {
				const subNav = document.createElement("nav");
				header.appendChild(subNav);
				subNav.classList.add("options-container");
				subNav.classList.add("suboptions-container");
				for (
					const [subHref, subData]
					of Object.entries(data.subPages)
				) {
					const anchor = document.createElement("a");
					subNav.appendChild(anchor);
					anchor.classList.add("option");
					anchor.href = subHref;
					anchor.textContent = subData.label;
					if (subHref !== subPage) {
						anchor.dataset.optionCurrent = "no";
					} else {
						anchor.dataset.optionCurrent = "yes";
					}
				}
			}
		}
	}
}
