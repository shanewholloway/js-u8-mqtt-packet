import { encode_varint } from '../mqtt_varint.mjs'
import { mqtt_props } from '../mqtt_props.mjs'
import { mqtt_pkt_writer_pool } from './_pkt_writer.mjs'


export class mqtt_type_writer_v4 {
  constructor() {
    this._pkt_writer(this)
  }

  static init() {
    let mqtt_writer = class extends this {}
    mqtt_writer.prototype._pkt_writer =
      mqtt_pkt_writer_pool()
    return mqtt_writer
  }

  as_pkt(hdr) { return this.pack([hdr]) }

  u8(v) { this.push([ v & 0xff ]) }
  u16(v) { this.push([ (v>>>8) & 0xff, v & 0xff ]) }
  u32(v) { this.push([ (v>>>24) & 0xff, (v>>>16) & 0xff, (v>>>8) & 0xff, v & 0xff ]) }
  vint(v) { this.push( encode_varint(v) )}

  _u16_bin(u8_buf) {
    this.u16(u8_buf.byteLength)
    this.push(u8_buf)
  }

  flush(buf) {
    if (null != buf)
      this.push(
        'string' === typeof buf
          ? new TextEncoder('utf-8').encode(buf)
          : buf )

    this.push = false
  }

  bin(u8_buf) {
    if (! u8_buf) return this.u16(0)
    if ('string' === typeof u8_buf)
      return this.utf8(u8_buf)

    if (u8_buf.length !== u8_buf.byteLength)
      u8_buf = new Uint8Array(u8_buf)
    this._u16_bin(u8_buf)
  }

  utf8(v) { this._u16_bin( new TextEncoder('utf-8').encode(v) ) }

  pair(k,v) {
    this.utf8(k)
    this.utf8(v)
  }

  u8_flags(v, enc_flags, b0=0) {
    if (undefined !== v && isNaN(+v))
      v = enc_flags(v, 0)

    v |= b0
    this.push([v])
    return v
  }

  u8_reason(v) { this.push([v | 0]) }

}


export class mqtt_type_writer_v5 extends mqtt_type_writer_v4 {
  props(props) {
    if (! props)
      return this.u8(0)

    if (! Array.isArray(props))
      props = props.entries
        ? Array.from(props.entries())
        : Object.entries(props)

    if (0 === props.length)
      return this.u8(0)

    let wrt = this._fork()
    for (let [name, value] of props) {
      let {id, type} = mqtt_props.get(name)
      wrt.u8(id)
      wrt[type](value)
    }

    this.push(wrt.pack([]))
  }

  _fork() {
    let self = { __proto__: this }
    this._pkt_writer(self)
    return self
  }
}
