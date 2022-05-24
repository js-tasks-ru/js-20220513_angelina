/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  if (fields.length === 0) {
    return {}
  }
  let resultObj = {};
  Object.entries(obj).forEach( item => {
    if (fields.includes(item[0])) {
      resultObj[item[0]] = obj[item[0]];
    }
  });
  return resultObj;
};
