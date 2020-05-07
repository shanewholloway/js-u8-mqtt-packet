import {decode_varint} from './mqtt_varint.mjs'

export function _mqtt_raw_pkt_decode_v(by_ref) {
  const [u8] = by_ref
  const [len_body, len_vh] = decode_varint(u8, 1)

  const len_pkt = len_body + len_vh
  if ( u8.byteLength >= len_pkt ) {

    by_ref[0] = u8.subarray(len_pkt)
    by_ref[1] = u8[0]
    by_ref[2] = 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt)

  } else by_ref.length = 1 // truncate

  return by_ref
}


export function _mqtt_raw_pkt_dispatch(decode_raw_pkt) {
  const l = [new Uint8Array(0)] // reuse array to prevent garbage collection churn on ephemeral ones
  return u8_buf => {
    l[0] = 0 === l[0].byteLength
      ? u8_buf : _u8_join(l[0], u8_buf)

    const res = []
    do {
      _mqtt_raw_pkt_decode_v(l)
      if (1 === l.length)
        return res

      const pkt = decode_raw_pkt(l[1], l[2])
      if (undefined !== pkt && null !== pkt)
        res.push( pkt )
    } while (1)
  }
}


function _u8_join(a, b) {
  const alen = a.byteLength
  const r = new Uint8Array(alen + b.byteLength)
  r.set(a, 0)
  r.set(b, alen)
  return r
}

