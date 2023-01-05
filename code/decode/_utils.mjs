import { decode_varint } from '../mqtt_varint.mjs'
import { mqtt_props } from '../mqtt_props.mjs'

const as_utf8 = u8 =>
  new TextDecoder('utf-8').decode(u8)

const step_from = idx =>
  (width, r) => ( r = idx, idx += width, r )

export class mqtt_type_reader_v4 {
  constructor(buf, idx=0) {
    this.buf = buf
    this.step = step_from(idx)
  }

  static with_info(... info_fn_list) {
    let mqtt_reader = class extends this {}
    for (let fn_info of info_fn_list)
      fn_info(mqtt_reader)
    return mqtt_reader
  }

  static reasons(pkt_type, ...reason_entries) {
    let proto = this.prototype
    proto._reasons_by = {... proto._reasons_by}

    let lut = (proto._reasons_by[pkt_type] ||= new Map())
    for (let [u8, reason] of reason_entries)
      lut.set( u8, reason )

    return this
  }


  has_more() {
    let {buf, step} = this
    return buf.byteLength > step(0)
  }

  u8() {
    let {buf, step} = this
    return buf[step(1)]
  }

  u16() {
    let {buf, step} = this
    let i = step(2)
    return (buf[i]<<8) | buf[i+1]
  }

  u32() {
    let {buf, step} = this
    let i = step(4)
    return (buf[i]<<24) | (buf[i+1]<<16) | (buf[i+2]<<8) | buf[i+3]
  }

  vint() {
    let {buf, step} = this
    let [n, vi, vi0] = decode_varint(buf, step(0))
    step(vi - vi0)
    return n
  }

  bin() {
    let {buf, step} = this
    let i = step(2)
    let len = (buf[i]<<8) | buf[i+1]
    let i0 = step(len)
    return buf.subarray(i0, i0+len)
  }

  utf8() { return as_utf8(this.bin()) }
  pair() { return [ as_utf8(this.bin()), as_utf8(this.bin()) ] }

  u8_flags(FlagsType) {
    let {buf, step} = this
    return new FlagsType(buf[step(1)])
  }

  u8_reason(lut_key) {
    let {buf, step} = this
    let v = buf[step(1)]
    if (null != v) {
      let r = this._reasons_by[lut_key]?.get(v)
      return new U8_Reason(v, r || lut_key)
    }
  }

  flush() {
    let {buf, step} = this
    this.step = this.buf = null
    return buf.subarray(step(0))
  }

}

export class mqtt_type_reader_v5 extends mqtt_type_reader_v4 {

  props() {
    let sub = this.vbuf()
    return null === sub ? null
      : this._fork(sub, 0)._read_props([])
  }

  vbuf() {
    let {buf, step} = this
    let [n, vi, vi0] = decode_varint(buf, step(0))
    step(n + vi - vi0)
    return 0 === n ? null
      : buf.subarray(vi, step(0))
  }

  _fork(buf, idx) {
    return { __proto__: this, buf, step: step_from(idx) }
  }

  _read_props(lst) {
    while (this.has_more()) {
      let k = this.u8()
      let p = mqtt_props.get( k )
      let v = this[p.type]()
      lst.push([p.name, v])
    }
    return lst
  }
}


class U8_Reason extends Number {
  constructor(u8, reason) { super(u8); this.reason = reason }
}

