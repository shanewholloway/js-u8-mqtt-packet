import {mqtt_type_writer} from './_utils.mjs'

export function mqtt_encode_disconnect(ns) {
  return ns.disconnect = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer()

    if (5 <= mqtt_level) {
      wrt.u8_reason(pkt.reason)
      wrt.props(pkt.props)
    }

    return wrt.as_pkt(0xe0)
  }
}
