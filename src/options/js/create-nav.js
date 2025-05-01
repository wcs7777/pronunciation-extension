document.addEventListener("DOMContentLoaded", () => {
	const mainPage = document.getElementById("mainPage").value;
	const subPage = document.getElementById("subPage").value;
	createNav(mainPage, subPage);
});

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
				"./audio-googlespeech.html": {
					label: "Google Speech",
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
		"./pron-by-sites.html": {
			label: "Pron By Sites",
			subPages: {},
		},
		"./set-custom-ipa.html": {
			label: "Set Custom",
			subPages: {
				"./set-custom-ipa.html": {
					label: "IPA",
				},
				"./set-custom-audio.html": {
					label: "Audio",
				},
				"./set-custom-audio-text.html": {
					label: "Audio Text",
				},
			},
		},
		"./remove-ipa.html": {
			label: "Remove",
			subPages: {
				"./remove-ipa.html": {
					label: "Remove IPA",
				},
				"./remove-audio.html": {
					label: "Remove Audio",
				},
				"./remove-audio-text.html": {
					label: "Remove Audio Text",
				},
			},
		},
		"./download-storage.html": {
			label: "Download Storage",
			subPages: {},
		},
		"./update-storage-ipa.html": {
			label: "Update Storage",
			subPages: {
				"./update-storage-ipa.html": {
					label: "Update IPA Storage",
				},
				"./update-storage-audio.html": {
					label: "Update Audio Storage",
				},
				"./update-storage-audio-text.html": {
					label: "Update Audio Text Storage",
				},
				"./update-storage-options.html": {
					label: "Update Options Storage",
				},
			},
		},
		"./clear-storage.html": {
			label: "Clear Storage",
			subPages: {},
		},
		"./source-last-error-show-download.html": {
			label: "Source Last Error",
			subPages: {
				"./source-last-error-show-download.html": {
					label: "Show/Download",
				},
				"./source-last-error-clear.html": {
					label: "Clear",
				},
			},
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
	const toggle = document.createElement("div");
	toggle.style.cursor = "pointer";
	toggle.style.width = "100%";
	toggle.style.height = "18px";
	toggle.style.color = "#333";
	toggle.style.fontSize = "10px";
	toggle.style.fontWeight = "bold";
	toggle.style.textAlign = "center";
	toggle.innerHTML = "&#9650;";
	let visible = true;
	toggle.addEventListener("click", () => {
		visible = !visible;
		for (const nav of header.querySelectorAll("nav")) {
			nav.classList.toggle("invisible", !visible);
		}
	toggle.innerHTML = visible ? "&#9650;" : "&#9660;";
	});
	header.appendChild(toggle);
}
