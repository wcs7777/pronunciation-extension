import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";
import { createSortableOrder, sortSortableOrder } from "./utils-sortable.js";

/**
 * @type {{
 *     unalengua: HTMLElement,
 *     unalenguaEnabled: HTMLInputElement,
 * }}
 */
const el = {
	unalengua: byId("unalenguaOrder"),
	unalenguaEnabled: byId("unalenguaEnabled"),
	save: byId("save"),
};

/**
 * @type {SortableJS}
 */
let sortable = null;

document.addEventListener("DOMContentLoaded", async () => {
	try {
		sortable = createSortableOrder(byId("sourcesOrder"), "order-to-text");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async ({ currentTarget }) => {
	try {
		/**
		 * @type {Options}
		 */
		const options = {
			ipa: {
				sources: {
					unalengua: {
						enabledToText: el.unalenguaEnabled.checked,
						orderToText: parseInt(el.unalengua.dataset.orderToText),
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo(currentTarget, "IPA Sources Order settings saved");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	/**
	 * @type {Options}
	 */
	const opt = await getAllOptions();
	el.unalenguaEnabled.checked = opt.ipa.sources.unalengua.enabledToText;
	sortSortableOrder(sortable, el, opt.ipa.sources, "order-to-text");
}
