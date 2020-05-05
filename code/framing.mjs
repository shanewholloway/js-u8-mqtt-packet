import {decode_varint} from './mqtt_varint.mjs'
import {mqtt_cmd_by_type} from './mqtt_cmds.mjs'


export function _mqtt_raw_pkt_decode_v(u8_ref, _pkt_ctx_) {
  const [u8] = u8_ref
  const [len_body, len_vh] = decode_varint(u8, 1)

  const len_pkt = len_body + len_vh
  if ( u8.byteLength >= len_pkt ) {
    const b0 = u8[0], cmd = b0 & 0xf0
    u8_ref[0] = u8.subarray(len_pkt)

    return { __proto__: _pkt_ctx_,
      b0, cmd, id: b0>>>4, hdr: b0 & 0x0f,
      type_obj: mqtt_cmd_by_type(cmd),
      u8_body: 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt)
      }
  }
}


export function _mqtt_raw_pkt_dispatch(u8_pkt_dispatch) {
  const _px0_ = {}
  _px0_._base_ = _px0_
  return (_pkt_ctx_=_px0_) => {
    if (_pkt_ctx_ !== _pkt_ctx_._base_)
      throw '_pkt_ctx_._base_'

    const l = [new Uint8Array(0)] // reuse array to prevent garbage collection churn on ephemeral ones
    return u8_buf => {
      l[0] = 0 === l[0].byteLength
        ? u8_buf : _u8_join(l[0], u8_buf)

      const res = []
      while (true) {
        const u8_pkt = _mqtt_raw_pkt_decode_v(l, _pkt_ctx_)
        if (undefined !== u8_pkt)
          res.push( u8_pkt_dispatch(u8_pkt) )
        else return res
      }
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

