import {encode_varint} from '../mqtt_varint.mjs'
import {mqtt_props} from '../mqtt_props.mjs'
import {mqtt_pkt_writer_pool} from './_pkt_writer.mjs'

export * from './_pkt_writer.mjs'

const pack_utf8 = v => new TextEncoder('utf-8').encode(v)
const pack_u16 = v => [ (v>>>8) & 0xff, v & 0xff ]
const pack_u32 = v => [ (v>>>24) & 0xff, (v>>>16) & 0xff, (v>>>8) & 0xff, v & 0xff ]

export class mqtt_type_writer {
  constructor() {
    this._pkt_writer(this)
  }

  as_pkt(hdr) { return this.pack([hdr]) }

  u8(v) { this.push([ v & 0xff ])}
  u16(v) { this.push( pack_u16(v) )}
  u32(v) { this.push( pack_u32(v) )}
  vint(v) { this.push( encode_varint(v) )}

  _u16_bin(u8_buf) {
    const {push} = this
    push( pack_u16( u8_buf.byteLength ))
    push( u8_buf )
  }

  flush(buf) {
    if (null != buf)
      this.push(
        'string' === typeof buf
          ? pack_utf8(buf) : buf )

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

  props(props) {
    if (! props)
      return this.u8(0)

    if (! Array.isArray(props))
      props = props.entries
        ? Array.from(props.entries())
        : Object.entries(props)
    else if (0 === props.length)
      return this.u8(0)

    const wrt = this._fork()
    for (const [name, value] of props) {
      const {id, type} = mqtt_props.get(name)
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

mqtt_type_writer.prototype._pkt_writer = 
  mqtt_pkt_writer_pool()
