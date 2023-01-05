
export function mqtt_decode_unsubscribe(ns, mqtt_reader) {
  return ns[0xa] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    let topic_list = pkt.topics = []
    while (rdr.has_more())
      topic_list.push(rdr.utf8())

    return pkt }
}

