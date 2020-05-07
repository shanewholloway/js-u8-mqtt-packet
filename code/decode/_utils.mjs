import {decode_varint} from '../mqtt_varint.mjs'
import {mqtt_props} from '../mqtt_props.mjs'

const as_utf8 = u8 =>
  new TextDecoder('utf-8').decode(u8)

const step_from = idx =>
  (width, r) => ( r = idx, idx += width, r )

export class mqtt_type_reader {
  constructor(buf, idx=0) {
    this.buf = buf
    this.step = step_from(idx)
  }

  _fork(buf, idx) {
    return { __proto__: this, buf, step: step_from(idx) }
  }

  has_more() {
    const {buf, step} = this
    return buf.byteLength > step(0)
  }

  u8() {
    const {buf, step} = this
    return buf[step(1)]
  }

  u16() {
    const {buf, step} = this
    const i = step(2)
    return (buf[i]<<8) | buf[i+1]
  }

  u32() {
    const {buf, step} = this
    const i = step(4)
    return (buf[i]<<24) | (buf[i+1]<<16) | (buf[i+2]<<8) | buf[i+3]
  }

  vint() {
    const {buf, step} = this
    const [n, vi] = decode_varint(buf, step(0))
    step(vi)
    return n
  }

  bin() {
    const {buf, step} = this
    const i = step(2)
    const len = (buf[i]<<8) | buf[i+1]
    const i0 = step(len)
    return buf.subarray(i0, i0+len)
  }

  utf8() { return as_utf8(this.bin()) }
  pair() { return [ as_utf8(this.bin()), as_utf8(this.bin()) ] }

  u8_flags(FlagsType) {
    const {buf, step} = this
    return new FlagsType(buf[step(1)])
  }

  u8_reason(fn_reason) {
    const {buf, step} = this
    return fn_reason( buf[step(1)] )
  }

  flush() {
    const {buf, step} = this
    this.step = this.buf = null
    return buf.subarray(step(0))
  }

  props() {
    const {buf, step} = this

    const [len, vi] = decode_varint(buf, step(0))
    const end_part = vi + len
    step(end_part)
    if (0 === len)
      return null

    const prop_entries = []
    const rdr = this._fork(
      buf.subarray(vi, end_part) )

    while (rdr.has_more()) {
      const {name, type} = mqtt_props.get( rdr.u8() )
      const value = rdr[type]()
      prop_entries.push([ name, value ])
    }

    return prop_entries
  }
}



class U8_Reason extends Number {
  constructor(u8, reason) { super(u8); this.reason = reason }
}

export function bind_reason_lookup(reason_entries) {
  const reason_map = new Map()
  for (const [u8, reason] of reason_entries)
    reason_map.set( u8, new U8_Reason(u8, reason) )

  return reason_map.get.bind(reason_map)
}

