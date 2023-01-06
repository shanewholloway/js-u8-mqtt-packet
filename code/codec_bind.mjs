import { _mqtt_raw_pkt_dispatch } from './framing.mjs'

const _pkt_types = ['~', 'connect', 'connack', 'publish', 'puback', 'pubrec', 'pubrel', 'pubcomp', 'subscribe', 'suback', 'unsubscribe', 'unsuback', 'pingreq', 'pingresp', 'disconnect', 'auth']

export function mqtt_bind_session_ctx(mqtt_level, opts) {
  let _pkt_ctx_ = Object.defineProperties(opts._pkt_ctx_ || {}, {
    hdr:  {get() { return this.b0 & 0xf }},
    id:   {get() { return this.b0 >>> 4 }},
    type: {get() { return _pkt_types[this.b0 >>> 4] }},
  })

  let op, _decode_by_id=[], _encode_by_type={}
  for (op of opts.encode_fns)
    op(_encode_by_type, opts.mqtt_writer)
  for (op of opts.decode_fns)
    op(_decode_by_id, opts.mqtt_reader)

  let session_encode = (type, pkt) =>
    _encode_by_type[type]( mqtt_level, pkt )

  let session_decode = _pkt_ctx_ =>
    _mqtt_raw_pkt_dispatch(
      (b0, u8_body, fn_decode_pkt) => (
        fn_decode_pkt = _decode_by_id[b0>>>4] || _decode_by_id[0],
        fn_decode_pkt?.({__proto__: _pkt_ctx_, b0}, u8_body) ) )

  return _base_ => (
    _base_ = _base_ || {__proto__: _pkt_ctx_, mqtt_level, get _base_() { return _base_ }},
    [ session_decode(_base_), session_encode, _base_ ])
}

