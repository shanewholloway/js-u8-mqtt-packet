import { mqtt_reader_v4 as base_v4 } from './mqtt_reader_lean.js'


export function with_reasons(mqtt_reader, by_kind) {
  for (let [k,lut] of Object.entries(by_kind))
    by_kind[k] = new Map(lut)

  return class extends mqtt_reader {
    _reason_for(v, pkt_kind) {
      return by_kind[pkt_kind]?.get(v) || by_kind.all.get(v)
    }
    warn(msg) {
      let pkt = this.pkt
      pkt.warn ? pkt.warn(msg, pkt)
        : console.warn('[u8-mqtt-packet] '+msg)
    }
  }
}


export const reasons_v4 = /* #__PURE__ */ {
  connack: [
    [ 0x01, 'conn refused: unacceptable protocol version'],
    [ 0x02, 'conn refused: identifier rejected'],
    [ 0x03, 'conn refused: server unavailable'],
    [ 0x04, 'conn refused: bad user name or password'],
    [ 0x05, 'conn refused: not authorized'],
  ],
  suback: [
    [ 0x00, 'qos=0'],
    [ 0x01, 'qos=1'],
    [ 0x02, 'qos=2'],
  ],
  unsuback: [
    [ 0x11, 'no subscription existed'],
  ],
  puback: [
    [ 0x10, 'no matching subscribers'],
  ],
  all: [
    [ 0, ''], // Success
    [ 0x80, 'unspecified error'], // disconnect puback suback unsuback
    [ 0x83, 'implementation specific error'], // connack disconnect puback suback unsuback
    [ 0x87, 'not authorized'], // connack disconnect puback suback unsuback
    [ 0x8F, 'topic filter invalid'], // disconnect suback unsuback
    [ 0x91, 'packet identifier in use'], // puback suback unsuback
    [ 0x92, 'packet identifier not found' ], // pubxxx
  ]}

export const mqtt_reader_v4 = /* #__PURE__ */
  with_reasons(base_v4, reasons_v4)

