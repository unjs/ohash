import type { HashFn } from './hash-fn.type'

/**
 * Init xxHash
 * @description Only if `hash-wasm` peer dependency is installed
 */
export async function initXxHash (): Promise<HashFn> {
  const { createXXHash32 } = await import('hash-wasm')

  const hasher = await createXXHash32()

  return (message) => {
    hasher.init()
    hasher.update(message)
    return hasher.digest()
  }
}
