import { mqtt_raw_dispatch } from './framing.mjs'

const _pkt_types = ['~', 'connect', 'connack', 'publish', 'puback', 'pubrec', 'pubrel', 'pubcomp', 'subscribe', 'suback', 'unsubscribe', 'unsuback', 'pingreq', 'pingresp', 'disconnect', 'auth']

export function mqtt_pkt_ctx(mqtt_level, opts, pkt_ctx) {
  pkt_ctx = {
    __proto__: pkt_ctx || opts.pkt_ctx,
    mqtt_level,
    get hdr() { return this.b0 & 0xf },
    get id() { return this.b0 >>> 4 },
    get type() { return _pkt_types[this.b0 >>> 4] },
  }

  let op, _decode_by_id=[], _encode_by_type={}
  for (op of opts.encode_fns)
    op(_encode_by_type, opts.mqtt_writer)
  for (op of opts.decode_fns)
    op(_decode_by_id, opts.mqtt_reader)

  return {
    pkt_ctx,

    encode_pkt(type, pkt) {
      return _encode_by_type[type]( mqtt_level, pkt ) },

    decode_pkt(b0, u8_body) {
      let fn_decode = _decode_by_id[b0>>>4] || _decode_by_id[0]
      return fn_decode?.({__proto__: this.pkt_ctx, b0}, u8_body) },

    mqtt_stream() {
      let self = { __proto__: this, pkt_ctx: { __proto__: pkt_ctx } }
      self.pkt_ctx._base_ = self.pkt_ctx
      self.decode = mqtt_raw_dispatch(self)
      return self
    },
  }
}

export { mqtt_pkt_ctx as default }
