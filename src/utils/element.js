import { isDigit } from "./string.js";

/**
 * @param {string} url
 * @returns {Promise<Document>}
 */
export async function url2document(url, credentials="omit") {
	const response = await fetch(url, { credentials });
	const status = response.status;
	if (status !== 200) {
		const message = await response.text();
		throw new Error(JSON.stringify({ status, message}));
	}
	const text = await response.text();
	return new DOMParser().parseFromString(text, "text/html");
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
		throw new Error(JSON.stringify({ status, message}));
	}
	const blob = await response.blob();
	return blob;
}

/**
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export async function blob2base64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("load", onLoad);
		reader.addEventListener("error", onError);
		reader.readAsDataURL(blob);

		/**
		 * @param {ProgressEvent<FileReader>} event
		 * @returns {void}
		 */
		function onLoad(event) {
			removeListeners();
			return resolve(event.target.result);
		}

		/**
		 * @param {ErrorEvent} error
		 * @returns {void}
		 */
		function onError(error) {
			removeListeners();
			return reject(error);
		}

		/**
		 * @returns {void}
		 */
		function removeListeners() {
			reader.removeEventListener("load", onLoad);
			reader.removeEventListener("error", onError);
		}

	});
}

/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
export const byId = (id) => document.getElementById(id);

/**
 * @param {HTMLInputElement} target
 * @returns {void}
 */
export function onlyNumber(target) {
	target.addEventListener("keydown", (e) => {
		const preventDefault = (
			!isDigit(e.key) &&
			(e.key !== "." || target.value.includes(".")) &&
			!isNavigationKey(e)
		);
		if (preventDefault) {
			e.preventDefault();
		}
	});
}

/**
 * @param {HTMLInputElement} target
 * @returns {void}
 */
export function onlyShorcut(target) {
	target.addEventListener("keydown", (e) => {
		if (e.key.length === 1) {
			e.preventDefault();
			target.value = e.key.toUpperCase();
		}
	});
}

/**
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
export function isNavigationKey(event) {
	return event.ctrlKey || [
		"Backspace",
		"Delete",
		"ArrowLeft",
		"ArrowRight",
		"Tab",
		"CapsLock",
		"Home",
		"End",
		"Enter",
	]
		.includes(event.key);
}
