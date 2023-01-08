import {decode_varint} from './mqtt_varint.js'


export function mqtt_raw_dispatch(opt) {
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
      let u8_body = 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt)

      u8 = u8.subarray(len_pkt)

      let pkt = opt.decode_pkt(b0, u8_body, opt)
      if (null != pkt)
        res.push( pkt )
    }
  }
}

function _u8_join(a, b) {
  let alen = a.byteLength, r = new Uint8Array(alen + b.byteLength)
  r.set(a, 0)
  r.set(b, alen)
  return r
}

