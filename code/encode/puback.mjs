import {mqtt_type_writer} from './_utils.mjs'

export function mqtt_encode_puback(ns) {
  return ns.puback = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer()

    wrt.u16(pkt.pkt_id)
    if (5 <= mqtt_level) {
      wrt.u8_reason(pkt.reason)
      wrt.props(pkt.props)
    }

    return wrt.as_pkt(0x40)
  }
}

