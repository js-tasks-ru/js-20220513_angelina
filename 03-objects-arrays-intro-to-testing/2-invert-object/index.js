/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) {
    return;
  }

  const resultObj = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k) {
      resultObj[v] = k;
    }
  }
  return resultObj;
}
