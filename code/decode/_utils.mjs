import { decode_varint } from '../mqtt_varint.mjs'
import { mqtt_props } from '../mqtt_props.mjs'

class U8_Reason extends Number {
  static of(v, pkt_kind, by_kind) {
    let self = new this(v)
    self.reason = by_kind?.[pkt_kind]?.get(v) || pkt_kind
    return self
  }
}

export class mqtt_reader_v4 {
  static of(buf) { return this.prototype.of(buf) }
  of(buf) {
    let step = (width, k) => (k=0|step.k, step.k=k+width, k)
    return {__proto__: this, buf, step}
  }

  has_more() {
    return this.buf.byteLength > (this.step.k|0)
  }

  u8() {
    return this.buf[this.step(1)]
  }

  u16() {
    let {buf, step} = this, i = step(2)
    return (buf[i]<<8) | buf[i+1]
  }

  u32() {
    let {buf, step} = this, i = step(4)
    return (buf[i]<<24) | (buf[i+1]<<16) | (buf[i+2]<<8) | buf[i+3]
  }

  vint() {
    let {buf, step} = this
    let [n, vi, vi0] = decode_varint(buf, step.k|0)
    step(vi - vi0)
    return n
  }

  bin() {
    let {buf, step} = this, i = step(2)
    let len = (buf[i]<<8) | buf[i+1]
    i = step(len)
    return buf.subarray(i, i+len)
  }

  utf8() { return new TextDecoder('utf-8').decode(this.bin()) }
  pair() { return [ this.utf8(), this.utf8() ] }

  flags(FlagsType) { return new FlagsType(this.buf[this.step(1)]) }

  reason(pkt_kind) {
    let v = this.buf[this.step(1)]
    if (null != v)
      return U8_Reason.of(v, pkt_kind, this._reasons_by)
  }

  flush() {
    let {buf, step} = this
    this.step = this.buf = null
    return buf.subarray(step.k|0)
  }

}

export class mqtt_reader_v5 extends mqtt_reader_v4 {
  props() {
    let {buf, step} = this
    let [n, vi, vi0] = decode_varint(buf, step.k|0)
    step(n + vi - vi0)
    if (0 === n) return null

    let res={}, fork = this.of(buf.subarray(vi, step.k|0))
    while (fork.has_more()) {
      let pt = mqtt_props.get( fork.u8() )
        , value = fork[pt.type]()
      res[pt.name] = ! pt.op ? value
        : fork[pt.op](res[pt.name], value)
    }
    return res
  }

  kv_obj(obj=Object.create(null), [k,v]) {
    obj[k] = v
    return obj
  }
  u8_vec(vec=[], u8) {
    vec.push(u8)
    return vec
  }

  /*
  vbuf() {
    let {buf, step} = this
    let [n, vi, vi0] = decode_varint(buf, step.k|0)
    step(n + vi - vi0)
    return 0 === n ? null
      : buf.subarray(vi, step.k|0)
  }
  */
}

export function mqtt_reader_info(mqtt_reader, ... info_fn_list) {
  mqtt_reader = class extends mqtt_reader {
    static reasons(pkt_type, ...reason_entries) {
      let proto = this.prototype
      proto._reasons_by = {... proto._reasons_by}

      let lut = (proto._reasons_by[pkt_type] ||= new Map())
      for (let [u8, reason] of reason_entries)
        lut.set( u8, reason )

      return this
    }
  }

  for (let fn_info of info_fn_list)
    fn_info(mqtt_reader)

  return mqtt_reader
}

