import { byId } from "../../utils/element.js";
import { getAllOptions, saveOptions, showInfo } from "./utils.js";
import { createSortableOrder, sortSortableOrder } from "./utils-sortable.js";

/**
 * @type {{
 *     cambridge: HTMLElement,
 *     cambridgeEnabled: HTMLInputElement,
 *     oxford: HTMLElement,
 *     oxfordEnabled: HTMLInputElement,
 *     translatorMind: HTMLElement,
 *     translatorMindEnabled: HTMLInputElement,
 *     unalengua: HTMLElement,
 *     unalenguaEnabled: HTMLInputElement,
 * }}
 */
const el = {
	cambridge: byId("cambridgeOrder"),
	cambridgeEnabled: byId("cambridgeEnabled"),
	oxford: byId("oxfordOrder"),
	oxfordEnabled: byId("oxfordEnabled"),
	translatorMind: byId("translatorMindOrder"),
	translatorMindEnabled: byId("translatorMindEnabled"),
	unalengua: byId("unalenguaOrder"),
	unalenguaEnabled: byId("unalenguaEnabled"),
	save: byId("save"),
};

/** @type {SortableJS} */
let sortable = null;

document.addEventListener("DOMContentLoaded", async () => {
	try {
		sortable = createSortableOrder(byId("sourcesOrder"), "order");
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		/** @type {Options} */
		const options = {
			ipa: {
				sources: {
					cambridge: {
						enabled: el.cambridgeEnabled.checked,
						order: parseInt(el.cambridge.dataset.order),
					},
					oxford: {
						enabled: el.oxfordEnabled.checked,
						order: parseInt(el.oxford.dataset.order),
					},
					translatorMind: {
						enabled: el.translatorMindEnabled.checked,
						order: parseInt(el.translatorMind.dataset.order),
					},
					unalengua: {
						enabled: el.unalenguaEnabled.checked,
						order: parseInt(el.unalengua.dataset.order),
					},
				},
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("IPA Sources Order settings saved");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	/** @type {Options} */
	const opt = await getAllOptions();
	el.cambridgeEnabled.checked = opt.ipa.sources.cambridge.enabled;
	el.oxfordEnabled.checked = opt.ipa.sources.oxford.enabled;
	el.translatorMindEnabled.checked = opt.ipa.sources.translatorMind.enabled;
	el.unalenguaEnabled.checked = opt.ipa.sources.unalengua.enabled;
	sortSortableOrder(sortable, el, opt.ipa.sources, "order");
}
