import {decode_varint} from './mqtt_varint.mjs'


export function _mqtt_raw_pkt_dispatch(decode_raw_pkt) {
  let u8 = new Uint8Array(0)
  return u8_buf => {
    u8 = 0 === u8.byteLength
      ? u8_buf : _u8_join(u8, u8_buf)

    const res = []
    while (1) {
      const [len_body, len_vh] = decode_varint(u8, 1)
      const len_pkt = len_body + len_vh

      if ( u8.byteLength < len_pkt )
        return res

      let b0 = u8[0]
      let u8_body = 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt)

      u8 = u8.subarray(len_pkt)

      const pkt = decode_raw_pkt(b0, u8_body)
      if (undefined !== pkt && null !== pkt)
        res.push( pkt )
    }
  }
}

export function mqtt_raw_packets() {
  let u8 = new Uint8Array(0)
  return u8_buf => {
    u8 = 0 === u8.byteLength
      ? u8_buf : _u8_join(u8, u8_buf)

    const res = []
    while (1) {
      const [len_body, len_vh] = decode_varint(u8, 1)
      const len_pkt = len_body + len_vh
      if ( u8.byteLength < len_pkt )
        return res

      res.push({
        b0: u8[0],
        u8_body: u8.subarray(len_vh, len_pkt),
        u8_raw: u8.subarray(0, len_pkt) })

      u8 = u8.subarray(len_pkt)
    }
  }
}

function _u8_join(a, b) {
  const alen = a.byteLength
  const r = new Uint8Array(alen + b.byteLength)
  r.set(a, 0)
  r.set(b, alen)
  return r
}

