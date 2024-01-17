import { mqtt_raw_dispatch } from './framing.js'

const _pkt_types = /* #__PURE__ */ ['~', 'connect', 'connack', 'publish', 'puback', 'pubrec', 'pubrel', 'pubcomp', 'subscribe', 'suback', 'unsubscribe', 'unsuback', 'pingreq', 'pingresp', 'disconnect', 'auth']


export function mqtt_pkt_ctx(mqtt_level, opts, pkt_api=opts.pkt_ctx) {
  let _as_pkt_ctx = pkt_api => ({
        __proto__: pkt_api,
        get hdr() { return this.b0 & 0xf },
        get id() { return this.b0 >>> 4 },
        get type() { return _pkt_types[this.b0 >>> 4] },
        mqtt_level })


  let op, _decode_by_id=[], _encode_by_type={}
  for (op of opts.encode_fns)
    op(_encode_by_type, opts.mqtt_writer)
  for (op of opts.decode_fns)
    op(_decode_by_id, opts.mqtt_reader)

  return {
    pkt_api, pkt_ctx: _as_pkt_ctx(pkt_api),

    encode_pkt: (type, pkt) =>
      _encode_by_type[type]( mqtt_level, pkt ),

    decode_pkt(b0, u8_body) {
      if (b0.map) // Uint8Array in first arg
        return mqtt_raw_dispatch(this)(b0)[0]

      let fn_decode = _decode_by_id[b0>>>4] || _decode_by_id[0]
      return fn_decode?.({__proto__: this.pkt_ctx, b0}, u8_body) },

    mqtt_stream(pkt_api=this.pkt_api) {
      let self = { __proto__: this, pkt_ctx: _as_pkt_ctx(pkt_api) }
      self.decode = mqtt_raw_dispatch(self)
      return self },
  }
}

export * from './version.js'
export { mqtt_pkt_ctx as default }
