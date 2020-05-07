import {bind_reason_lookup} from './_utils.mjs'
import {_mqtt_decode_suback} from './suback_unsuback.mjs'


export function mqtt_decode_suback(ns) {
  const _suback_reason_ = bind_reason_lookup([
    // MQTT 3.1.1
    [ 0x00, 'Granted QoS 0'],
    [ 0x01, 'Granted QoS 1'],
    [ 0x02, 'Granted QoS 2'],

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
  ])

  return ns[0x9] = _mqtt_decode_suback(_suback_reason_)
}
