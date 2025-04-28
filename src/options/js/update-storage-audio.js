import { byId, blob2object } from "../../utils/element.js";
import { audioTable } from "../../utils/storage-tables.js";
import { showInfo } from "./utils.js";

/**
 * @type {{
 *     file: HTMLInputElement,
 *     text: HTMLTextAreaElement,
 *     update: HTMLButtonElement,
 *     clear: HTMLButtonElement,
 * }}
 */
const el = {
	file: byId("file"),
	text: byId("text"),
	update: byId("update"),
	clear: byId("clear"),
};

document.addEventListener("DOMContentLoaded", () => {
	setFieldsValues();
});

el.update.addEventListener("click", async ({ currentTarget }) => {
	try {
		const file = el.file.files?.[0];
		let values = null;
		if (file) {
			values = await blob2object(file);
		} else {
			const text = el.text.value.trim();
			if (!text) {
				showInfo("File or text should be set");
				return;
			}
			values = JSON.parse(text);
		}
		await audioTable.setMany(values);
		setFieldsValues();
		showInfo("Audio storage updated");
	} catch (error) {
		if (error instanceof SyntaxError) {
			showInfo("Invalid JSON");
		}
		console.error(error);
	}
});

el.clear.addEventListener("click", () => {
	setFieldsValues();
});

/**
 * @returns {<void>}
 */
function setFieldsValues() {
	el.file.value = "";
	el.text.value = "";
}
