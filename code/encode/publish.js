
export function mqtt_encode_publish(ns, mqtt_writer) {
  return ns.publish = ( mqtt_level, pkt ) => {
    let qos = (pkt.qos & 0x3) << 1
    let wrt = mqtt_writer.of(pkt)

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
