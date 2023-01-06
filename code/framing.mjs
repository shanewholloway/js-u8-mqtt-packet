import {decode_varint} from './mqtt_varint.mjs'


export function _mqtt_raw_pkt_dispatch(decode_raw_pkt, inc_raw) {
  let u8 = new Uint8Array(0)
  return u8_buf => {
    u8 = 0 === u8.byteLength
      ? u8_buf : _u8_join(u8, u8_buf)

    let res = []
    while (1) {
      let [len_body, len_vh] = decode_varint(u8, 1)
      let len_pkt = len_body + len_vh

      if ( u8.byteLength < len_pkt )
        return res

      let b0 = u8[0]
      let u8_raw = inc_raw && u8.subarray(0, len_pkt)
      let u8_body = 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt)
      u8 = u8.subarray(len_pkt)

      let pkt = decode_raw_pkt(b0, u8_body, u8_raw)
      if (null != pkt)
        res.push( pkt )
    }
  }
}

export const mqtt_raw_packets = () =>
  _mqtt_raw_pkt_dispatch(
    (b0, u8_body, u8_raw) => ({b0, u8_body, u8_raw}), true)

function _u8_join(a, b) {
  let alen = a.byteLength, r = new Uint8Array(alen + b.byteLength)
  r.set(a, 0)
  r.set(b, alen)
  return r
}

