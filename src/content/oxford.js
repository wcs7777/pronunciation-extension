import { $, $$, normalizeWord } from "../utils.js";
import updateDatabaseWithWebsite from "./update-database-with-website.js";

let lastAudioPlayed = $("div.sound.audio_play_button.pron-us");
console.log(lastAudioPlayed);

updateDatabaseWithWebsite(
	{
		defaultIpaShortcut: true,
		setIpaShortcut: true,
		setAudioShortcut: true,
	},
	{
		getAudio,
		getWord,
		getIpa,
	},
)
	.then(() => console.log("update database with oxford"))
	.catch(console.error);

for (const div of $$("div.sound.audio_play_button")) {
	div.addEventListener("click", () => lastAudioPlayed = div);
}

function getWord() {
	return normalizeWord(lastAudioPlayed.title);
}

function getIpa() {
	return lastAudioPlayed.nextElementSibling.textContent;
}

function getAudio() {
	return lastAudioPlayed.dataset.srcOgg;
}
