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
		throw {
			status,
			message,
			error: new Error(response.statusText),
		};
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
		throw {
			status,
			message,
			error: new Error(response.statusText),
		};
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
 * @param {string} base64
 * @param {string} mimeType
 * @returns {Blob}
 */
export function base64ToBlob(base64, mimeType) {
    const bytesAsStr = atob(base64);
    const length = bytesAsStr.length;
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        array[i] = bytesAsStr.charCodeAt(i);
    }
    return new Blob([array], { type: mimeType });
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function buffer2hex(buffer) {
	const array = [...new Uint8Array(buffer)];
	return array.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function buffer2base64(buffer) {
	const array = [...new Uint8Array(buffer)];
	const binary = array.map(b => String.fromCharCode(b)).join("");
	return btoa(binary);
}

/**
 * @param {Blob} blob
 * @returns {Promise<object | object[]>}
 */
export async function blob2object(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("load", onLoad);
		reader.addEventListener("error", onError);
		reader.readAsText(blob);

		/**
		 * @param {ProgressEvent<FileReader>} event
		 * @returns {void}
		 */
		function onLoad(event) {
			removeListeners();
			try {
				const text = event.target.result;
				return resolve(JSON.parse(text));
			} catch (error) {
				return reject(error);
			}
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
 * @param {object} obj
 * @returns {Blob}
 */
export function object2blob(obj) {
	return new Blob(
		[JSON.stringify(obj, null, 2)],
		{ type: "application/json" },
	);
}

/**
 * @param {object} obj
 * @param {string} filename
 * @returns {Promise<void>}
 */
export async function downloadObject(obj, filename) {
	const url = URL.createObjectURL(object2blob(obj));
	try {
		await download(url, filename);
	} finally {
		URL.revokeObjectURL(url);
	}
}

/**
 * @param {string} url
 * @param {string} filename
 * @returns {Promise<void>}
 */
export function download(url, filename) {
	return new Promise(async (resolve, reject) => {
		try {
			const id = await browser.downloads.download({ url, filename });
			browser.downloads.onChanged.addListener(cb);

			/**
			 * @param {browser.downloads._OnChangedDownloadDelta} delta
			 * @returns {void}
			 */
			function cb(delta) {
				if (delta.id !== id) {
					return;
				}
				if (delta.state?.current === "complete") {
					browser.downloads.onChanged.removeListener(cb);
					return resolve();
				}
				if (delta?.error?.current) {
					browser.downloads.onChanged.removeListener(cb);
					reject(new Error(delta.error.current));
				}
			}

		} catch (error) {
			return reject(error);
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
 * @param {boolean} includesDot
 * @returns {void}
 */
export function onlyNumber(target, includesDot=true) {
	target.addEventListener("keydown", (e) => {
		let validKey = false;
		/**
		 * @param {boolean} c
	 	 * @returns {boolean}
		 */
		const or = (c) => validKey = validKey ? validKey : validKey || c;
		or(isDigit(e.key));
		or(isNavigationKey(e));
		or(e.key === "." && includesDot && !target.value.includes("."));
		if (!validKey) {
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
