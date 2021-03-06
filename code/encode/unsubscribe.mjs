import {mqtt_type_writer} from './_utils.mjs'

export function mqtt_encode_unsubscribe(ns) {
  return ns.unsubscribe = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer()

    wrt.u16(pkt.pkt_id)
    if (5 <= mqtt_level)
      wrt.props(pkt.props)

    for (const topic of pkt.topics)
      wrt.utf8(topic)

    return wrt.as_pkt(0xa2)
  }
}
