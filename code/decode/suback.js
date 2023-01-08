import {_mqtt_decode_suback} from './suback_unsuback.js'


export function mqtt_decode_suback(ns, mqtt_reader) {
  return ns[0x9] = _mqtt_decode_suback(mqtt_reader)
}

export function _suback_v4(mqtt_reader) {
  mqtt_reader.reasons('suback',
    // MQTT 3.1.1
    [ 0x00, 'Granted QoS 0'],
    [ 0x01, 'Granted QoS 1'],
    [ 0x02, 'Granted QoS 2'],
  )
}

export function _suback_v5(mqtt_reader) {
  _suback_v4(mqtt_reader)

  mqtt_reader.reasons('suback',
    // MQTT 5.0
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
    [ 0x97, 'Quota exceeded'],
    [ 0x9E, 'Shared Subscriptions not supported'],
    [ 0xA1, 'Subscription Identifiers not supported'],
    [ 0xA2, 'Wildcard Subscriptions not supported'],
  )
}
