import { $, normalizeWord } from "../utils.js";
import updateDatabaseWithWebsite from "./update-database-with-website";

updateDatabaseWithWebsite(
	{
		setIpaShortcut: true,
		defaultIpaShortcut: true,
	},
	{
		getIpa,
		getWord,
	}
)
	.then(() => console.log("update database with tophonetics"))
	.catch(console.error);

function getWord() {
	return normalizeWord($("#text_to_transcribe").value);
}

function getIpa() {
	const span = $(".transcribed_word");
	if (!span) {
		throw new Error("IPA does not found!");
	}
	return `/${span.textContent}/`;
}
