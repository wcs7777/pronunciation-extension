import { $, normalizeWord } from "../utils/utils.js";
import updateDatabaseWithWebsite from "./update-database-with-website.js";

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

function getWord() {
	return normalizeWord($("span.hw.dhw").textContent);
}

function getIpa() {
	return `/${$("span.ipa").textContent}/`;
}

function getAudio() {
	return $("span.us audio source").getAttribute?.("src");
}
