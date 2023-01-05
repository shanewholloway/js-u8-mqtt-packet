
export function mqtt_encode_disconnect(ns, mqtt_writer) {
  return ns.disconnect = ( mqtt_level, pkt ) => {
    let wrt = new mqtt_writer()

    if (pkt && 5 <= mqtt_level) {
      if (pkt.reason || pkt.props) {
        wrt.u8_reason(pkt.reason)
        wrt.props(pkt.props)
      }
    }

    return wrt.as_pkt(0xe0)
  }
}

