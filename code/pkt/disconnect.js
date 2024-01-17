
export function mqtt_encode_disconnect(ns, mqtt_writer) {
  return ns.disconnect = ( mqtt_level, pkt ) => {
    let wrt = mqtt_writer.for(pkt)

    if (pkt && 5 <= mqtt_level) {
      if (pkt.reason || pkt.props) {
        wrt.reason(pkt.reason)
        wrt.props(pkt.props)
      }
    }

    return wrt.as_pkt(0xe0)
  }
}


export function mqtt_decode_disconnect(ns, mqtt_reader) {
  return ns[0xe] = (pkt, u8_body) => {
    if (u8_body && 5 <= pkt.mqtt_level) {
      let rdr = mqtt_reader.for(pkt, u8_body)
      pkt.reason = rdr.reason(pkt.type)
      pkt.props = rdr.props()
    }
    return pkt }
}

