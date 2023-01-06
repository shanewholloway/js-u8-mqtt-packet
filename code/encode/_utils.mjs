import { encode_varint } from '../mqtt_varint.mjs'
import { mqtt_props } from '../mqtt_props.mjs'


export class mqtt_writer_v4 {
  static of() { return this.prototype.of() }
  of() { return {__proto__: this, $:[]} }

  static init() { return this }

  as_pkt(pkt_id) { return this.pack([pkt_id]) }

  push(...z) { this.$.push(...z) }
  pack(hdr) {
    let z, i, n=0, parts = this.$
    this.$ = false
    for (z of parts) n += z.length

    hdr = encode_varint(n, hdr)
    i = hdr.length

    let pkt = new Uint8Array(i + n)
    pkt.set(hdr, 0)
    for (z of parts) {
      pkt.set(z, i)
      i += z.length
    }
    return pkt
  }

  u8(v) { this.push([ v & 0xff ]) }
  u16(v, ...z) { this.push([ (v>>>8) & 0xff, v & 0xff ], ...z) }
  u32(v) { this.push([ (v>>>24) & 0xff, (v>>>16) & 0xff, (v>>>8) & 0xff, v & 0xff ]) }
  vint(v) { this.push( encode_varint(v) )}

  bin(u8_buf) {
    if (! u8_buf) return this.u16(0)
    if ('string' === typeof u8_buf)
      return this.utf8(u8_buf)

    if (u8_buf.length !== u8_buf.byteLength)
      u8_buf = new Uint8Array(u8_buf)

    this.u16(u8_buf.byteLength, u8_buf)
  }

  utf8(v) {
    let u8_buf = new TextEncoder('utf-8').encode(v)
    this.u16(u8_buf.byteLength, u8_buf)
  }
  pair(k,v) { this.utf8(k); this.utf8(v) }

  flags(v, enc_flags, b0=0) {
    if (undefined !== v && isNaN(+v))
      v = enc_flags(v, 0)

    v |= b0
    this.push([v])
    return v
  }

  reason(v) { this.push([v | 0]) }

  flush(buf) {
    if (null != buf)
      this.push(
        'string' === typeof buf
          ? new TextEncoder('utf-8').encode(buf)
          : buf )

    this.push = false
  }
}


export class mqtt_writer_v5 extends mqtt_writer_v4 {
  props(props) {
    if (! props)
      return this.u8(0)

    if (! Array.isArray(props))
      props = props.entries
        ? Array.from(props.entries())
        : Object.entries(props)

    if (0 === props.length)
      return this.u8(0)

    let wrt = this.of()
    for (let [name, value] of props) {
      let {id, type} = mqtt_props.get(name)
      wrt.u8(id)
      wrt[type](value)
    }

    this.push(wrt.pack())
  }
}
