/**
 * @param {any} target
 * @param {any} source
 * @param {{ prioritizeTargetObj: boolean, shallowCopyKeys: string[] }}
 * @return {any}
 */
export function deepMerge(
  target,
  source,
  { prioritizeTargetObj = false, shallowCopyKeys = [] } = {},
) {
  const tgtIsArr = Array.isArray(target);
  const srcIsArr = Array.isArray(source);
  const tgtIsObj = !tgtIsArr && target instanceof Object;
  const srcIsObj = !srcIsArr && source instanceof Object;
  if (tgtIsArr && srcIsArr) {
    const mergedArr = prioritizeTargetObj ? [...target] : [...source];
    for (const item of prioritizeTargetObj ? source : target) {
      if (!mergedArr.includes(item)) {
        mergedArr.push(item);
      }
    }
    return mergedArr;
  }
  if (tgtIsObj && srcIsObj) {
    const merged = { ...target };
    for (const key in source) {
      const tgt = target?.[key];
      const src = source[key];
      if (!shallowCopyKeys.includes(key)) {
        merged[key] = deepMerge(tgt, src, {
          prioritizeTargetObj,
          shallowCopyKeys,
        });
      } else {
        merged[key] = tgt ? (prioritizeTargetObj ? tgt : src) : src;
      }
    }
    return merged;
  }
  if (prioritizeTargetObj && (tgtIsObj || tgtIsArr)) {
    return target;
  } else {
    return source;
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
  const stringified = JSON.stringify(obj, Object.getOwnPropertyNames(obj));
  const parsed = JSON.parse(stringified);
  if (obj instanceof Error && obj?.stack) {
    parsed["stack"] = obj.stack;
  }
  return parsed;
}
