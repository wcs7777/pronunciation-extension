import { $, $$, normalizeWord } from "../utils/utils.js";
import updateDatabaseWithWebsite from "./update-database-with-website.js";

let lastAudioPlayed = $(".search-result-container audio");
console.log(lastAudioPlayed);

updateDatabaseWithWebsite(
	{
		setAudioShortcut: true,
	},
	{
		getAudio,
		getWord,
	},
)
	.then(() => console.log("update database with howjsay"))
	.catch(console.error);

for (const audio of $$(".search-result-container audio")) {
	audio.addEventListener("play", () => lastAudioPlayed = audio);
}

function getWord() {
	return normalizeWord(
		/for "(.+?)"/.exec(
			$(".search-result-container h3").textContent,
		)[1],
	);
}

function getAudio() {
	return $("source", lastAudioPlayed).src;
}
