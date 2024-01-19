import {decode_varint} from './mqtt_varint.js'


export function mqtt_raw_dispatch(opt) {
  let u8 = new Uint8Array(0), len_tip=0
  return u8_buf => {
    u8 = 0 === u8.byteLength
      ? u8_buf : _u8_join(u8, u8_buf)

    let res = []

    // wait for at least len_tip bytes for next (tip) message
    while ( u8.byteLength >= len_tip ) {

      // if varint is incomplete, return len_body=NaN
      let [len_body, len_vh] = decode_varint(u8, 1, NaN)
      let len_pkt = len_body + len_vh // may be NaN

      if (!( len_pkt <= u8.byteLength )) {
        // incomplete packet cases:
        // - len_pkt is less than available bytes
        // - len_pkt is NaN from decode_varint() due to lack of data
        len_tip = len_pkt || 0 // 0 when NaN
        break
      }

      let b0 = u8[0]
      let u8_body = 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt)

      u8 = u8.subarray(len_pkt)

      let pkt = opt.decode_pkt(b0, u8_body, opt)
      if (null != pkt)
        res.push( pkt )
    }

    return res
  }
}

function _u8_join(a, b) {
  let alen = a.byteLength, r = new Uint8Array(alen + b.byteLength)
  r.set(a, 0)
  r.set(b, alen)
  return r
}

