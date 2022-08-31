import { canPlay, setAudio } from "../background/audio.js";
import {
	optionsTable,
	ipaTable,
	ipaDefaultTable,
} from "../background/tables.js";
import showPopup from "../show-popup.js";

export default async function updateDatabaseWithWebsite(
	options={
		setAudioShortcut=false,
		setIpaShortcut=false,
		defaultIpaShortcut=false,
	}={},
	{
		getWord=nothing,
		getIpa=nothing,
		getAudio=nothing,
	}={},
) {
	const shortcuts = {};
	for (const option of Object.keys(options)) {
		if (options[option]) {
			shortcuts[await optionsTable.get(option)] = option;
		}
	}
	console.log("shortcuts", shortcuts);
	const keys = Object.keys(shortcuts);
	document.addEventListener("keydown", async (e) => {
		const key = e.key.toUpperCase();
		if (e.ctrlKey && keys.includes(key)) {
			try {
				e.preventDefault();
				const fns = {
					"setAudioShortcut": async () => {
						const playable = await canPlay(getAudio());
						if (playable) {
							feedback(await setAudio(getWord(), playable.src));
						}
					},
					"setIpaShortcut": async () => {
						return setIpa(getWord(), getIpa());
					},
					"defaultIpaShortcut": async () => {
						const word = getWord();
						return setIpa(word, await ipaDefaultTable.get(word));
					},
				};
				await fns[shortcuts[key]]();
			} catch (error) {
				console.error(error);
			}
		}
	});
}

const nothing = () => {
	throw new Error("Function argument cannot be empty!");
};

async function setIpa(word, ipa) {
	console.log("setIpa() word:", word);
	console.log("setIpa() ipa:", ipa);
	const oldIpa = await ipaTable.get(word);
	await ipaTable.set(word, ipa);
	feedback(`${word}: ${oldIpa} -> ${ipa}`);
}

function feedback(message) {
	console.log(message);
	showPopup({ message });
}
