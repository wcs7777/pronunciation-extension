import { $, $$, normalizeWord, onAppend } from "../utils/utils.js";
import updateDatabaseWithWebsite from "./update-database-with-website.js";

let audio = "";
let word = "";

updateDatabaseWithWebsite(
	{
		setAudioShortcut: true,
	},
	{
		getAudio,
		getWord,
	},
)
	.then(() => console.log("update database with linguee"))
	.catch(console.error);

onAppend({
	selectors: "audio#audio-player",
	listener: (nodes) => {
		for (const node of nodes) {
			const source = $("source", node);
			if (source) {
				audio = source.getAttribute("src");
				console.log(`audio: ${audio}`);
				break;
			}
		}
	},
});

for (const lemma of $$("h2.line.lemma_desc")) {
	$("a.audio", lemma).addEventListener("click", async () => {
		const dict = $("a.dictLink", lemma);
		if (dict) {
			word = normalizeWord(dict.textContent);
			console.log(`word: ${word}`);
		}
	});
}

function getAudio() {
	return audio;
}

function getWord() {
	return word;
}
