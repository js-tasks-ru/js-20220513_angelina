/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let result = '';
  if (size === 0) {
    return result;
  }
  if (!size) {
    return string;
  }
  let buffer = string[0];

  let i = 1;
  while (i < string.length + 1) {
    if (buffer.length < size && buffer[0] === string[i]) {
      buffer = buffer + string[i];
      i++;
    } else {
      result = result + buffer;
      if (string[i] === buffer[0]) {
        let j = i;
        while (j < string.length && string[j] === buffer[0]) {
          j++;
        }
        buffer = string[j];
        i = j + 1;
      } else {
        buffer = string[i];
        i++;
      }
    }
  }

  return result;
}
