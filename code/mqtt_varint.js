export function encode_varint(n, a=[]) {
  do {
    const ni = n & 0x7f
    n >>>= 7
    a.push( ni | (0===n ? 0 : 0x80) )
  } while (n > 0)
  return a
}


/*
export function decode_varint_loop(u8, i=0) {
  let i0 = i
  let shift = 0, n = (u8[i] & 0x7f)
  while ( 0x80 & u8[i++] )
    n |= (u8[i] & 0x7f) << (shift += 7)

  return [n, i, i0]
}
*/


export function decode_varint(u8, i=0) {
  let i0 = i
  // unrolled for a max of 4 chains
  let n = (u8[i] & 0x7f) <<  0
  if ( 0x80 & u8[i++] ) {
    n |= (u8[i] & 0x7f) <<  7
    if ( 0x80 & u8[i++] ) {
      n |= (u8[i] & 0x7f) << 14
      if ( 0x80 & u8[i++] ) {
        n |= (u8[i++] & 0x7f) << 21
      }
    }
  }
  return [n, i, i0]
}

