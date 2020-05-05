import {mqtt_type_reader, bind_reason_lookup} from './_utils.mjs'

export function mqtt_decode_disconnect(ns) {
  const _disconnect_reason_ = bind_reason_lookup([
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
  ])


  return ns[0xe] = pkt => {
    if (5 <= pkt.mqtt_level) {
      const rdr = new mqtt_type_reader(pkt.u8_body, 0)
      pkt.reason = rdr.u8_reason(_disconnect_reason_)
      pkt.props = rdr.props()
    }
    return pkt }
}
