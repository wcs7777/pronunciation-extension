import MemoryCache from "./memory-cache.js";

const documentCache = new MemoryCache("fetchDocumentCache", 6);

/**
 * @param {string} url
 * @param {string} credentials
 * @param {boolean} force
 * @returns {Promise<Document>}
 */
export async function url2document(url, credentials="omit", force=false) {
	/** @type {Document | null} */
	let document = !force ? documentCache.get(url) : null;
	if (!document) {
		const response = await fetch(url, { credentials });
		const status = response.status;
		if (status !== 200) {
			const message = await response.text();
			/** @type {PronunciationSourceLastError} */
			const le = {
				status,
				message,
				messageContentType: response.headers.get("Content-Type"),
				error: new Error(response.statusText),
			};
			throw le;
		}
		const text = await response.text();
		document = new DOMParser().parseFromString(text, "text/html");
		documentCache.set(url, document);
	}
	return document;
}

/**
 * @param {string} url
 * @returns {Promise<Blob>}
 */
export async function url2blob(url, credentials="omit") {
	const response = await fetch(url, { credentials });
	const status = response.status;
	if (status !== 200) {
		const message = await response.text();
		/** @type {PronunciationSourceLastError} */
		const le = {
			status,
			message,
			messageContentType: response.headers.get("Content-Type"),
			error: new Error(response.statusText),
		};
		throw le;
	}
	const blob = await response.blob();
	return blob;
}
