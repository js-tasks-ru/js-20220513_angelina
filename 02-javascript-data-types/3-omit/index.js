/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  if (fields.length === 0) {
    return obj;
  }
  let resultObj = {};
  Object.entries(obj).forEach( item => {
    if (!fields.includes(item[0])) {
      resultObj[item[0]] = obj[item[0]];
    }
  });
  return resultObj;
};
