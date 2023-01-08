
export function mqtt_decode_connack(ns, mqtt_reader) {
  class _connack_flags_ extends Number {
    get session_present() { return this & 0x01 !== 0 }
  }

  return ns[0x2] = (pkt, u8_body) => {
    let rdr = mqtt_reader.of(u8_body)

    let flags = pkt.flags =
      rdr.flags(_connack_flags_)

    pkt.reason = rdr.reason(pkt.type)
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()
    return pkt }
}


export function _connack_v4(mqtt_reader) {
  mqtt_reader.reasons('connack',
    // MQTT 3.1.1
    [ 0x00, 'Success'],
    [ 0x01, 'Connection refused, unacceptable protocol version'],
    [ 0x02, 'Connection refused, identifier rejected'],
    [ 0x03, 'Connection refused, server unavailable'],
    [ 0x04, 'Connection refused, bad user name or password'],
    [ 0x05, 'Connection refused, not authorized'],
  )
}

export function _connack_v5(mqtt_reader) {
  _connack_v4(mqtt_reader)

  mqtt_reader.reasons('connack',
    // MQTT 5.0
    [ 0x81, 'Malformed Packet'],
    [ 0x82, 'Protocol Error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x84, 'Unsupported Protocol Version'],
    [ 0x85, 'Client Identifier not valid'],
    [ 0x86, 'Bad User Name or Password'],
    [ 0x87, 'Not authorized'],
    [ 0x88, 'Server unavailable'],
    [ 0x89, 'Server busy'],
    [ 0x8A, 'Banned'],
    [ 0x8C, 'Bad authentication method'],
    [ 0x90, 'Topic Name invalid'],
    [ 0x95, 'Packet too large'],
    [ 0x97, 'Quota exceeded'],
    [ 0x99, 'Payload format invalid'],
    [ 0x9A, 'Retain not supported'],
    [ 0x9B, 'QoS not supported'],
    [ 0x9C, 'Use another server'],
    [ 0x9D, 'Server moved'],
    [ 0x9F, 'Connection rate exceeded'],
  )
}

