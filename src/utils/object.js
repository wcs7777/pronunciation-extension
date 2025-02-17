/**
 * @param {any} target
 * @param {any} source
 * @param {boolean} prioritizeTargetObj
 * @return {any}
 */
export function deepMerge(target, source, prioritizeTargetObj=false) {
	const tgt = structuredClone(target);
	const src = structuredClone(source);
	const tgtIsArr = Array.isArray(tgt);
	const srcIsArr = Array.isArray(src);
	const tgtIsObj = !tgtIsArr && tgt instanceof Object;
	const srcIsObj = !srcIsArr && src instanceof Object;
	if (tgtIsArr && srcIsArr) {
		return [
			...tgt,
			...src,
		];
	}
	if (tgtIsObj && srcIsObj) {
		for (const key in src) {
			tgt[key] = deepMerge(tgt[key], src?.[key], prioritizeTargetObj);
		}
		return tgt;
	}
	if (prioritizeTargetObj && (tgtIsObj || tgtIsArr)) {
		return tgt;
	} else {
		return src;
	}
}

/**
 * @param {any} left
 * @param {any} right
 * @return {boolean}
 */
export function deepEquals(left, right) {
	if (left === right) {
		return true;
	}
	if (left instanceof Object && right instanceof Object) {
		for (const key in left) {
			if (!deepEquals(left[key], right?.[key])) {
				return false;
			}
		}
		return true;
	}
	return false;
}

/**
 * @param {any} obj
 * @return {any}
 */
export function removeMethods(obj) {
	const stringified = JSON.stringify(
		obj,
		Object.getOwnPropertyNames(obj),
	);
	const parsed = JSON.parse(stringified);
	if (obj instanceof Error && obj?.stack) {
		parsed["stack"] = obj.stack;
	}
	return parsed;
}
