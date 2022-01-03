/*
 * This file contains some replacement functions...
 */

/*
 * Replacement for "_.findWhere()", which exists in underscore,
 * but got removed from lodash 4.x.
 * https://stackoverflow.com/questions/37301790/es6-equivalent-of-underscore-findwhere
 */
function findWhere(array, criteria) {
  return array.find(item => Object.keys(criteria).every(key => item[key] === criteria[key]))
} /* findWhere */

/*
 * Replacement for "_.where()", which exists in underscore,
 * but got removed from lodash 4.x.
 * https://stackoverflow.com/questions/58823625/underscore-where-es6-typescript-alternative
 */
function where(array, object) {
  let keys = Object.keys(object);
  return array.filter(item => keys.every(key => item[key] === object[key]));
}

/*
 * From: https://stackoverflow.com/questions/56932156/typescript-how-to-copy-only-properties-and-methods-from-interface-to-a-new-objec
 * */
export function pickFromObject<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for(const key of keys) result[key] = obj[key];
  return result;
}; /* pickFromObject */

export function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}; /* onlyUnique */

