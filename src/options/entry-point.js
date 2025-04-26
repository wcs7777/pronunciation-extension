document.addEventListener("DOMContentLoaded", async () => await main());

/**
 * @returns {Promise<void>}
 */
async function main() {
	try {
		const url = browser.runtime.getURL("src/options/pages/general.html");
		await browser.tabs.create({
			url,
			active: true,
		});
	} catch (error) {
		console.error(error);
	}
}
