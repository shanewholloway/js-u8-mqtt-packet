
export function mqtt_encode_publish(ns, mqtt_writer) {
  return ns.publish = ( mqtt_level, pkt ) => {
    let qos = (pkt.qos & 0x3) << 1
    let wrt = mqtt_writer.for(pkt)

    wrt.utf8(pkt.topic)
    if (0 !== qos)
      wrt.u16(pkt.pkt_id)

    if ( 5 <= mqtt_level) {
      wrt.props(pkt.props)
      wrt.flush(pkt.payload)
    } else {
      wrt.flush(pkt.payload)
    }

    return wrt.as_pkt(
      0x30 | qos | (pkt.dup ? 0x8 : 0) | (pkt.retain ? 0x1 : 0) )
  }
}

export function mqtt_decode_publish(ns, mqtt_reader) {
  return ns[0x3] = (pkt, u8_body) => {
    let {hdr} = pkt
    pkt.dup = Boolean(hdr & 0x8)
    pkt.retain = Boolean(hdr & 0x1)
    let qos = pkt.qos = (hdr>>1) & 0x3

    let rdr = mqtt_reader.for(pkt, u8_body)
    pkt.topic = rdr.utf8()
    if (0 !== qos)
      pkt.pkt_id = rdr.u16()

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    pkt.payload = rdr.flush()
    return pkt }
}

