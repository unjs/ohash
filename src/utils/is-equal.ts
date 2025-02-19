import { serialize, type SerializeOptions } from "../serialize";
/**
 * Compare two objects using reference equality and stable deep hashing.
 * @param {any} object1 First object
 * @param {any} object2 Second object
 * @param {SerializeOptions} SerializeOptions. Configuration options for hashing the objects. See {@link SerializeOptions}.
 * @return {boolean} true if equal and false if not
 * @api public
 */
export function isEqual(
  object1: any,
  object2: any,
  hashOptions: SerializeOptions = {},
): boolean {
  if (object1 === object2) {
    return true;
  }
  if (serialize(object1, hashOptions) === serialize(object2, hashOptions)) {
    return true;
  }
  return false;
}
