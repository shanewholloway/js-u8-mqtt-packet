export function encode_varint(n, a=[]) {
  do {
    const ni = n & 0x7f
    n >>>= 7
    a.push( ni | (0===n ? 0 : 0x80) )
  } while (n > 0)
  return a
}


export function decode_varint_loop(u8, vi=0, vi_tuple=[]) {
  let shift = 0, n = (u8[vi] & 0x7f)
  while ( 0x80 & u8[vi++] )
    n |= (u8[vi] & 0x7f) << (shift += 7)

  vi_tuple[0] = n
  vi_tuple[1] = vi
  return vi_tuple
}


export function decode_varint(u8, vi=0, vi_tuple=[]) {
  // unrolled for a max of 4 chains
  let n = (u8[vi] & 0x7f) <<  0
  if ( 0x80 & u8[vi++] ) {
    n |= (u8[vi] & 0x7f) <<  7
    if ( 0x80 & u8[vi++] ) {
      n |= (u8[vi] & 0x7f) << 14
      if ( 0x80 & u8[vi++] ) {
        n |= (u8[vi] & 0x7f) << 21
      }
    }
  }

  vi_tuple[0] = n
  vi_tuple[1] = vi
  return vi_tuple
}

