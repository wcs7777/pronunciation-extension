import { deepMerge }  from "../../utils/object.js";
import { optionsTable } from "../../utils/storage-tables.js";
import { showPopup } from "../../utils/show-popup.js";
import { threshold } from "../../utils/number.js";

/**
 * @returns {Promise<Options>}
 */
export async function getAllOptions() {
	return optionsTable.getAll();
}

/**
 * @param {Options} options
 * @param {?Options} currentOptions
 * @returns {Promise<void>}
 */
export async function saveOptions(options, currentOptions) {
	let currOpt = currentOptions;
	if (!currOpt) {
		/** @type {Options} */
		const tblOpt = await optionsTable.getAll();
		currOpt = tblOpt;
	}
	return optionsTable.setMany(deepMerge(currOpt, options, true));
}

/**
 * @param {string} value
 * @param {string | null} defaultValue
 * @returns {string | null}
 */
export function strOr(value, defaultValue) {
	return value.trim() || defaultValue;
}

/**
 * @param {string} value
 * @param {number | null} defaultValue
 * @param {number} min
 * @param {number} max
 * @returns {number | null}
 */
export function numOr(value, defaultValue, min=0, max=Number.MAX_VALUE) {
	const trimmed = value.trim();
	const num = trimmed.length > 0 ? parseFloat(trimmed) : defaultValue;
	return (
		num !== null && num !== undefined ?
		threshold(min, max, num) :
		null
	);
}

/**
 * @param {string} info
 * @param {closeTimeout} number
 * @returns {void}
 */
export function showInfo(info, closeTimeout=2000) {
	showPopup({
		text: info,
		position: {
			centerHorizontally: true,
			top: 200,
		},
		close: {
			timeout: closeTimeout,
		},
	});
}
