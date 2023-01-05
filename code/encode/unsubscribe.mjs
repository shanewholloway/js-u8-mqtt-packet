
export function mqtt_encode_unsubscribe(ns, mqtt_writer) {
  return ns.unsubscribe = ( mqtt_level, pkt ) => {
    let wrt = new mqtt_writer()

    wrt.u16(pkt.pkt_id)
    if (5 <= mqtt_level)
      wrt.props(pkt.props)

    for (let topic of pkt.topics)
      wrt.utf8(topic)

    return wrt.as_pkt(0xa2)
  }
}
