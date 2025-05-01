import defaultOptions from "../utils/default-options.js";
import { showPopup } from "../utils/show-popup.js";

const opt = {
	enabled: defaultOptions.alertMaxSelectionEnabled,
	maxLength: defaultOptions.alertMaxSelectionLength,
};
let alertSent = false;

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

changeOptions(opt);

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
	const text = document.getSelection().toString().trim();
	if (text.length < opt.maxLength) {
		alertSent = false;
	} else if (!alertSent) {
		alertSent = true;
		showPopup({
			text: `${text.length}/${maxLength} characters selected`,
			close: {
				timeout: 3000,
			},
			position: {
				centerHorizontally: true,
				top: 100,
			},
		});
	}
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
