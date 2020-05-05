import {mqtt_type_writer} from './_utils.mjs'

export function mqtt_encode_auth(ns) {
  return ns.auth = ( mqtt_level, pkt ) => {
    if (5 > mqtt_level)
      throw new Error('Auth packets are only available after MQTT 5.x')

    const wrt = new mqtt_type_writer()

    wrt.u8_reason(pkt.reason)
    wrt.props(pkt.props)

    return wrt.as_pkt(0xf0)
  }
}

