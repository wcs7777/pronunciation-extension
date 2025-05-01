import { optionsTable } from "../utils/storage-tables.js";
import { showPopup } from "../utils/show-popup.js";

const opt = {
	enabled: false,
	maxLength: 10000000000,
};
let alertPopupHost = null;

if (!browser.runtime.onMessage.hasListener(onMessage)) {
	browser.runtime.onMessage.addListener(onMessage);
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<string | void>}
 */
async function onMessage(message) {
	if (message.changeAlertMaxSelectionOptions) {
		changeOptions(message.changeAlertMaxSelectionOptions);
	}
}

(async () => {
	/**
	 * @type {Options}
	 */
	const options = await optionsTable.getAll();
	changeOptions({
		enabled: options.alertMaxSelectionEnabled,
		maxLength: options.alertMaxSelectionLength,
	});
})().catch(console.error);

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

/**
 * @param {{ enabled: boolean, maxLength: number }} options
 * @returns {void}
 */
function changeOptions(options) {
	opt.enabled = options.enabled;
	opt.maxLength = options.maxLength;
	if (opt.enabled) {
		document.addEventListener("selectionchange", onSelectionChange);
	} else {
		document.removeEventListener("selectionchange", onSelectionChange);
	}
}
