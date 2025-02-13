/**
 * @param {?PronunciationFetcherLastError} lastError
 * @param {number} timeout - in minutes
 * @param {number[]} okStatus
 * @returns {boolean}
 */
export function waitRateLimit(lastError, timeout=60, okStatus=[200, 404]) {
	const status = lastError?.status;
	const timestamp = lastError?.timestamp;
	if (status && !okStatus.includes(status)) {
		if (timestamp === null || timestamp == undefined) {
			throw Error("lastError.timestamp must be set");
		}
		console.log(`There is previous error status: ${status}`);
		const now = new Date().getTime();
		const diff = now - timestamp;
		if (diff < timeout * 60000) {
			console.log(
				`There are remaining ${diff / 60000} timeout minutes`,
			);
			return true;
		}
		console.log("Timeout finished");
	}
	return false;
}
