import { decode_varint } from './mqtt_varint.js'
import { mqtt_props } from './mqtt_props.js'

export class mqtt_reason extends Number {
  constructor(v, reason) {
    super(v)
    this.reason = `:${(this.ok = v<0x80) ? 'ok' : 'fail'}:${reason}`
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
      return new mqtt_reason(v, this._reason_for?.(v, pkt_kind))
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
      let v, pk = fork.u8(), pt = mqtt_props.get( pk )
      if (!pt) {
        res._unknown_ = pk
        this.warn(`unknown property: ${pk}`)
        break
      }

      v = fork[pt.type]()
      res[pt.name] = !pt.op ? v
        : fork[pt.op](res[pt.name], v)  // accumulate operation
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

  warn(msg) { console.warn('[u8-mqtt-packet] '+msg) }

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

