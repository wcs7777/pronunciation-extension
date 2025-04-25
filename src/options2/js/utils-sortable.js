import "../../utils/Sortable.min.js";
import { kebab2camel } from "../../utils/string.js";

/**
 * @param {HTMLElement} list
 * @param {string} dataIdAttrSuffix
 * @returns {SortableJS}
 */
export function createSortableOrder(list, dataIdAttrSuffix="order") {
	const dataIdAttr = `data-${dataIdAttrSuffix}`;
	const datasetKey = kebab2camel(dataIdAttrSuffix);
	return Sortable.create(list, {
		animation: 150,
		ghostClass: "dragging",
		dataIdAttr: dataIdAttr,
		forceFallback: true,
		onEnd: () => {
			const children = Array.from(
				list.querySelectorAll(`[${dataIdAttr}]`),
			);
			for (const [index, element] of children.entries()) {
				const order = index + 1;
				element.dataset[datasetKey] = order
					.toString()
					.padStart(2, "0");
			}
		},
	});
}

/**
 * @param {SortableJS} sortable
 * @param {{ [key: string]: HTMLElement }} items
 * @param {{ [key: string]: { [key: string]: number } }} initialOrder
 * @param {string} dataIdAttrSuffix
 * @returns {void}
 */
export function sortSortableOrder(sortable, items, initialOrder, dataIdAttrSuffix="order") {
	const datasetKey = kebab2camel(dataIdAttrSuffix);
	for (const [key, value] of Object.entries(items)) {
		if (key in initialOrder) {
			const order = initialOrder[key][datasetKey];
			value.dataset[datasetKey] = order
				.toString()
				.padStart(2, "0");
		}
	}
	sortable.sort(sortable.toArray().toSorted(), false);
}
