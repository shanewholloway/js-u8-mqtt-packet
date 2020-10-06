import {mqtt_type_reader} from './_utils.mjs'

export function mqtt_decode_publish(ns) {
  return ns[0x3] = (pkt, u8_body) => {
    const {hdr} = pkt
    pkt.dup = Boolean(hdr & 0x8)
    pkt.retain = Boolean(hdr & 0x1)
    const qos = pkt.qos = (hdr>>1) & 0x3

    const rdr = new mqtt_type_reader(u8_body, 0)
    pkt.topic = rdr.utf8()
    if (0 !== qos)
      pkt.pkt_id = rdr.u16()

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    pkt.payload = rdr.flush()
    return pkt }
}

