
export function mqtt_encode_unsubscribe(ns, mqtt_writer) {
  return ns.unsubscribe = ( mqtt_level, pkt ) => {
    let wrt = mqtt_writer.for(pkt)

    wrt.u16(pkt.pkt_id)
    if (5 <= mqtt_level)
      wrt.props(pkt.props)

    for (let topic of pkt.topics)
      wrt.utf8(topic)

    return wrt.as_pkt(0xa2)
  }
}

export function mqtt_decode_unsubscribe(ns, mqtt_reader) {
  return ns[0xa] = (pkt, u8_body) => {
    let rdr = mqtt_reader.for(pkt, u8_body)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    let topic_list = pkt.topics = []
    while (rdr.has_more())
      topic_list.push(rdr.utf8())

    return pkt }
}

