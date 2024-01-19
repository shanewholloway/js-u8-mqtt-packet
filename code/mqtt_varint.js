export function encode_varint(n, a=[]) {
  if (n<0 || n>0xfffffff)
    throw new RangeError("varint") // see max value of [Variable Byte Integer](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901011)

  a.push((n<0x80 ? 0 : 0x80) | (n & 0x7f))
  for(; ( n>>>=7 ) > 0 ;)
    a.push((n<0x80 ? 0 : 0x80) | (n & 0x7f))
  return a
}

export function decode_varint(u8, i0=0, invalid) {
  let shift=0, i=i0, b=u8[i++], n=(b & 0x7f)
  for(; b & 0x80;)
    n |= ((b=u8[i++]) & 0x7f) << (shift += 7)

  if (shift > 21)
    throw new Error("varint decode error") // see max value of [Variable Byte Integer](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901011)

  return (u8.length < i || shift > 21)
    ? [invalid, i0, i0] // fail: insuffecient u8 bytes to decode
    : [n, i, i0] // successful value
}

