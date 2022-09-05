export default function download(url, filename) {
	return new Promise(async (resolve, reject) => {
		try {
			const id = await browser.downloads.download({ url, filename });
			browser.downloads.onChanged.addListener(listener);

			function listener(delta) {
				if (delta.id === id) {
					if (delta?.state?.current === "complete") {
						browser.downloads.onChanged.removeListener(listener);
						resolve(`${filename} download completed`);
					} else if (delta?.error?.current) {
						browser.downloads.onChanged.removeListener(listener);
						reject(new Error(delta.error.current));
					}
				}
			}
		} catch (error) {
			return reject(error);
		}
	});
}
