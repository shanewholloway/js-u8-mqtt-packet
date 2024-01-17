
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


export function mqtt_decode_puback(ns, mqtt_reader) {
  return ns[0x4] = (pkt, u8_body) => {
    let rdr = mqtt_reader.of(u8_body)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level) {
      pkt.reason = rdr.reason(pkt.type)
      pkt.props = rdr.props()
    }

    return pkt }
}

