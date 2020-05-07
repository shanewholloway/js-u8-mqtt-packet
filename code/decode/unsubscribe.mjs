import {mqtt_type_reader} from './_utils.mjs'

export function mqtt_decode_unsubscribe(ns) {
  return ns[0xa] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    const topic_list = pkt.topics = []
    while (rdr.has_more())
      topic_list.push(rdr.utf8())

    return pkt }
}

