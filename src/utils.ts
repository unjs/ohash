import { objectHash, HashOptions } from './object-hash'
/**
 * Compare two objects using reference equality and stable deep hashing.
 * @param {any} object1 First object
 * @param {any} object2 Second object
 * @param {HashOptions} hash options
 * @return {boolean} true if equal and false if not
 * @api public
 */
export function isEqual (object1: any, object2: any, hashOptions: HashOptions = {}): boolean {
  if (object1 === object2) {
    return true
  }
  if (objectHash(object1, hashOptions) === objectHash(object2, hashOptions)) {
    return true
  }
  return false
}
