
export function mqtt_encode_puback(ns, mqtt_writer) {
  return ns.puback = ( mqtt_level, pkt ) => {
    let wrt = mqtt_writer.of(pkt)

    wrt.u16(pkt.pkt_id)
    if (5 <= mqtt_level) {
      wrt.reason(pkt.reason)
      wrt.props(pkt.props)
    }

    return wrt.as_pkt(0x40)
  }
}

