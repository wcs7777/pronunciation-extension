import defaultOptions from "../../utils/default-options.js";
import { byId } from "../../utils/element.js";
import { optionsTable } from "../../utils/storage-tables.js";
import { showInfo } from "./utils.js";

/**
 * @type {{
 *     options: HTMLButtonElement,
 * }}
 */
const el = {
	options: byId("options"),
};

el.options.addEventListener("click", async () => {
	try {
		const msg = "Are you sure to restore the options to default?";
		if (!window.confirm(msg)) {
			return;
		}
		await optionsTable.setMany(defaultOptions);
		showInfo("Default options restored");
	} catch (error) {
		console.error(error);
	}
});
