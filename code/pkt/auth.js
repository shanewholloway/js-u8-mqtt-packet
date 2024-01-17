
export function mqtt_encode_auth(ns, mqtt_writer) {
  return ns.auth = ( mqtt_level, pkt ) => {
    if (5 > mqtt_level)
      throw new Error('Auth packets are only available after MQTT 5.x')

    let wrt = mqtt_writer.of(pkt)

    wrt.reason(pkt.reason)
    wrt.props(pkt.props)

    return wrt.as_pkt(0xf0)
  }
}

export function mqtt_decode_auth(ns, mqtt_reader) {
  return ns[0xf] = (pkt, u8_body) => {
    if ( 5 <= pkt.mqtt_level ) {
      let rdr = mqtt_reader.of(u8_body)
      pkt.reason = rdr.reason(pkt.type)
      pkt.props = rdr.props()
    }
    return pkt }
}

