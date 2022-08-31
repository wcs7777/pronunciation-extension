import { $, $$, isNodeType, onAppend } from "../utils.js";
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

onAppend(document.body, { childList: true }, async (nodes) => {
	for (const node of nodes) {
		if (isNodeType(node, "audio")) {
			const source = $("source", node);
			console.log("source", source);
			if (source) {
				audio = source.getAttribute("src");
				console.log(`audio: ${audio}`);
				break;
			}
		}
	}
});

for (const lemma of $$("h2.line.lemma_desc")) {
	$("a.audio", lemma).addEventListener("click", async () => {
		const dict = $("a.dictLink", lemma);
		if (dict) {
			word = dict.textContent;
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
