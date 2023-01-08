
export function mqtt_decode_publish(ns, mqtt_reader) {
  return ns[0x3] = (pkt, u8_body) => {
    let {hdr} = pkt
    pkt.dup = Boolean(hdr & 0x8)
    pkt.retain = Boolean(hdr & 0x1)
    let qos = pkt.qos = (hdr>>1) & 0x3

    let rdr = mqtt_reader.of(u8_body)
    pkt.topic = rdr.utf8()
    if (0 !== qos)
      pkt.pkt_id = rdr.u16()

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    pkt.payload = rdr.flush()
    return pkt }
}

