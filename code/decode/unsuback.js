import {_mqtt_decode_suback} from './suback_unsuback.js'


export function mqtt_decode_unsuback(ns, mqtt_reader) {
  return ns[0xb] = _mqtt_decode_suback(mqtt_reader)
}

export function _unsuback_v4(mqtt_reader) {
  mqtt_reader.reasons('unsuback',
    // MQTT 3.1.1
    [ 0x00, 'Success'],
    [ 0x11, 'No subscription existed'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
  )
}

export { _unsuback_v4 as _unsuback_v5 }
