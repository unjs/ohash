import { serialize } from "../serialize";
/**
 * Compare two objects using reference equality and stable deep hashing.
 * @param {any} object1 First object
 * @param {any} object2 Second object
 * @return {boolean} true if equal and false if not
 */
export function isEqual(object1: any, object2: any): boolean {
  if (object1 === object2) {
    return true;
  }
  if (typeof object1 !== typeof object2) {
    return false;
  }
  return serialize(object1) === serialize(object2);
}
