
export function mqtt_decode_pubxxx(ns, mqtt_reader) {
  return ns[0x5] = ns[0x6] = ns[0x7] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0)

    pkt.pkt_id = rdr.u16()
    pkt.reason = rdr.u8_reason('pubxxx', mqtt_reader)
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()
    return pkt }
}

export function _pubxxx_v4(mqtt_reader) {
  mqtt_reader.reasons('pubxxx',
    // MQTT 3.1.1
    [ 0x00, 'Success' ],
    [ 0x92, 'Packet Identifier not found' ],
  )
}

export { _pubxxx_v4 as _pubxxx_v5 }
