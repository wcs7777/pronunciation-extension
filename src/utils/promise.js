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
 * @returns {Promise<any>}
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
