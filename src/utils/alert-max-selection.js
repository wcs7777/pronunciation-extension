import { showPopup } from "./show-popup.js";

const opt = {
	enabled: false,
	maxLength: 10000000000,
};
let alertPopupHost = null;

/**
 * @param {{ enabled: boolean, maxLength: number }} options
 * @returns {void}
 */
export function changeOptions(options) {
	opt.enabled = options.enabled;
	opt.maxLength = options.maxLength;
	if (opt.enabled) {
		document.addEventListener("selectionchange", onSelectionChange);
	} else {
		document.removeEventListener("selectionchange", onSelectionChange);
	}
}

/**
 * @returns {void}
 */
function onSelectionChange() {
	if (opt.enabled) {
		alertMaxSelection(opt.maxLength);
	}
}

/**
 * @param {number} maxLength
 * @returns {void}
 */
function alertMaxSelection(maxLength) {
	if (
		selectedLength() >= maxLength &&
		(!alertPopupHost || !document.body.contains(alertPopupHost))
	) {
		const textFn = () => {
			return `${selectedLength()}/${maxLength} characters selected`;
		};
		const closeConditionFn = () => {
			return selectedLength() < maxLength;
		}
		alertPopupHost = showPopup({
			text: textFn(),
			close: {
				timeout: 600000,
			},
			position: {
				centerHorizontally: true,
				top: 100,
			},
		}, textFn, closeConditionFn);
	}
}

/**
 * @returns {number}
 */
function selectedLength() {
	return document.getSelection().toString().trim().length;
}
