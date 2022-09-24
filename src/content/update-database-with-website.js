import { canPlay, setAudio } from "../audio.js";
import {
	optionsTable,
	ipaTable,
	ipaDefaultTable,
	audioTable,
} from "../tables.js";
import showPopup from "../show-popup.js";
import { asyncReduce } from "../utils.js";

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
	const shortcuts = await asyncReduce(
		Object.entries(options).filter(([, value]) => value === true),
		{},
		async (obj, [key]) => {
			return {
				...obj,
				[await optionsTable.get(key)]: key,
			};
		},
	);
	console.log("shortcuts", shortcuts);
	const keys = Object.keys(shortcuts);
	document.addEventListener("keydown", async (e) => {
		const key = e.key.toUpperCase();
		if (e.ctrlKey && keys.includes(key)) {
			try {
				e.preventDefault();
				const fns = {
					"setAudioShortcut": async () => {
						const playable = await canPlay(getAudio()).catch(() => false);
						if (playable) {
							feedback(await setAudio(getWord(), playable.src, audioTable));
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

function nothing() {
	throw new Error("Function argument cannot be empty!");
};

async function setIpa(word, ipa) {
	const oldIpa = await ipaTable.get(word);
	await ipaTable.set(word, ipa);
	feedback(`${word}: ${oldIpa} -> ${ipa}`);
}

function feedback(message) {
	console.log(message);
	showPopup({ message });
}
