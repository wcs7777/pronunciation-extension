/**
 * @param {string} url
 * @returns {Promise<HTMLAudioElement>}
 */
export async function url2audio(url) {
	return new Promise((resolve, reject) => {
		const audio = new Audio(url);
		audio.addEventListener("canplay", onCanPlay);
		audio.addEventListener("error", onError);

		function onCanPlay() {
			removeListeners();
			return resolve(audio);
		}

		function onError(error) {
			removeListeners();
			return reject(error);
		}

		function removeListeners() {
			audio.removeEventListener("canplay", onCanPlay);
			audio.removeEventListener("error", onError);
		}

	});
}

/**
 * @param {string} url
 * @returns {Promise<Document>}
 */
export async function url2document(url, credentials="omit") {
	const response = await fetch(url, { credentials });
	if (response.status !== 200) {
		throw response.status;
	}
	const text = await response.text();
	return new DOMParser().parseFromString(text, "text/html");
}
