
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


export function mqtt_decode_disconnect(ns, mqtt_reader) {
  return ns[0xe] = (pkt, u8_body) => {
    if (u8_body && 5 <= pkt.mqtt_level) {
      let rdr = mqtt_reader.of(u8_body)
      pkt.reason = rdr.reason(pkt.type)
      pkt.props = rdr.props()
    }
    return pkt }
}


export function _disconnect_v5(mqtt_reader) {
  mqtt_reader.reasons('disconnect',
    // MQTT 5.0
    [ 0x00, 'Normal disconnection'],
    [ 0x04, 'Disconnect with Will Message'],
    [ 0x80, 'Unspecified error'],
    [ 0x81, 'Malformed Packet'],
    [ 0x82, 'Protocol Error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x89, 'Server busy'],
    [ 0x8B, 'Server shutting down'],
    [ 0x8D, 'Keep Alive timeout'],
    [ 0x8E, 'Session taken over'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x90, 'Topic Name invalid'],
    [ 0x93, 'Receive Maximum exceeded'],
    [ 0x94, 'Topic Alias invalid'],
    [ 0x95, 'Packet too large'],
    [ 0x96, 'Message rate too high'],
    [ 0x97, 'Quota exceeded'],
    [ 0x98, 'Administrative action'],
    [ 0x99, 'Payload format invalid'],
    [ 0x9A, 'Retain not supported'],
    [ 0x9B, 'QoS not supported'],
    [ 0x9C, 'Use another server'],
    [ 0x9D, 'Server moved'],
    [ 0x9E, 'Shared Subscriptions not supported'],
    [ 0x9F, 'Connection rate exceeded'],
    [ 0xA0, 'Maximum connect time'],
    [ 0xA1, 'Subscription Identifiers not supported'],
    [ 0xA2, 'Wildcard Subscriptions not supported'],
  )
}
