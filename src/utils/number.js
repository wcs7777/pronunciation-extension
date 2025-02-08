/**
 * @param {number} min
 * @param {number} max
 * @param {number} value
 * @returns {number}
 */
export function threshold(min, max, value) {
	return Math.max(min, Math.min(max, value));
}
