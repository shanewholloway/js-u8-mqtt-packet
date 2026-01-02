if ('function' !== typeof globalThis.Mocha)
  throw new Error('Mocha expected to be available')

export const {describe, it, before, after} = globalThis
export {it as test}
