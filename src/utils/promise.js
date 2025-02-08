/**
 * Go style error handling for Promise
 * @param {Promise<string>} promise
 * @returns {Promise<{ error: Error | null, value: string | null }>}
 */
export async function goString(promise) {
	let error = null;
	let value = null;
	try {
		value = await promise;
	} catch (e) {
		error = e;
	}
	return { error, value };
}

/**
 * Go style error handling for Promise
 * @param {Promise<Blob>} promise
 * @returns {Promise<{ error: Error | null, value: Blob | null }>}
 */
export async function goBlob(promise) {
	let error = null;
	let value = null;
	try {
		value = await promise;
	} catch (e) {
		error = e;
	}
	return { error, value };
}

/**
 * @param {number} timeout - ms
 * @returns {Promise<void>}
 */
export function sleep(timeout) {
	return new Promise((resolve, _) => {
		setTimeout(() => resolve(), timeout);
	});
}

/**
 * @param {number} timeout - ms
 * @param {any} value - resolve argument
 * @returns {Promise<void>}
 */
export function resolveTimeout(timeout, value) {
	return new Promise((resolve, _) => {
		setTimeout(() => resolve(value), timeout);
	});
}

/**
 * @param {number} delay - ms
 * @param {Promise} promise
 * @returns {Promise}
 */
export async function delayPromise(delay, promise) {
	await sleep(delay);
	return promise;
}
