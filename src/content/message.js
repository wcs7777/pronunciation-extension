import IpaPopup from "../utils/ipa-popup.js";

if (!browser.runtime.onMessage.hasListener(onMessage)) {
	browser.runtime.onMessage.addListener(onMessage);
}

/**
 * @param {BackgroundMessage} message
 * @returns {Promise<string | void>}
 */
async function onMessage(message) {
	if (message.type === "showIpa") {
		const popup = new IpaPopup(
			message.showIpa.ipa,
			message.showIpa.options,
			message.origin,
		);
		return popup.show();
	} else if (message.type === "getSelectedText") {
		return window.getSelection().toString();
	} else {
		throw new Error(`Invalid message: ${message}`);
	}
}
