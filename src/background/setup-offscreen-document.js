/** @type {Promise<void | null>} */
let creating = null;

export default async function setupOffscreenDocument() {
	await creating;
	const url = "src/background/offscreen.html";
	const contexts = await chrome.runtime.getContexts({
		contextTypes: ["OFFSCREEN_DOCUMENT"],
		documentUrls: [chrome.runtime.getURL(url)],
	});
	if (contexts?.length > 0) {
		return;
	}
	if (creating) {
		await creating;
		return;
	}
	creating = chrome.offscreen.createDocument({
		url,
		reasons: [
			chrome.offscreen.Reason.AUDIO_PLAYBACK,
			chrome.offscreen.Reason.DOM_PARSER,
		],
		justification: "Play audio and parse DOM documents",
	});
	await creating;
	creating = null;
}
