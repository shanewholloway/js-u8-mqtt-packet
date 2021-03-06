import {mqtt_type_reader, bind_reason_lookup} from './_utils.mjs'

export function mqtt_decode_connack(ns) {
  class _connack_flags_ extends Number {
    get session_present() { return this & 0x01 !== 0 }
  }

  const _connack_reason_ = bind_reason_lookup([
    // MQTT 3.1.1
    [ 0x00, 'Success'],
    [ 0x01, 'Connection refused, unacceptable protocol version'],
    [ 0x02, 'Connection refused, identifier rejected'],
    [ 0x03, 'Connection refused, server unavailable'],
    [ 0x04, 'Connection refused, bad user name or password'],
    [ 0x05, 'Connection refused, not authorized'],

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
  ])


  return ns[0x2] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0)

    const flags = pkt.flags =
      rdr.u8_flags(_connack_flags_)

    pkt.reason = rdr.u8_reason(_connack_reason_)
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()
    return pkt }
}

