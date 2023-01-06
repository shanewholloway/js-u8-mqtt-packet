
export function mqtt_encode_disconnect(ns, mqtt_writer) {
  return ns.disconnect = ( mqtt_level, pkt ) => {
    let wrt = mqtt_writer.of(pkt)

    if (pkt && 5 <= mqtt_level) {
      if (pkt.reason || pkt.props) {
        wrt.reason(pkt.reason)
        wrt.props(pkt.props)
      }
    }

    return wrt.as_pkt(0xe0)
  }
}

