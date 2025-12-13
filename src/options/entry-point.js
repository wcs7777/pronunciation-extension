document.addEventListener("DOMContentLoaded", async () => await main());

/**
 * @returns {Promise<void>}
 */
async function main() {
	try {
		const url = chrome.runtime.getURL("src/options/pages/general.html");
		await chrome.tabs.create({
			url,
			active: true,
		});
	} catch (error) {
		console.error(error);
	}
}
