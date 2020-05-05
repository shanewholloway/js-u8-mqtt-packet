import {bind_reason_lookup} from './_utils.mjs'
import {_mqtt_decode_suback} from './_suback_unsuback.mjs'


export function mqtt_decode_unsuback(ns) {
  const _unsuback_reason_ = bind_reason_lookup([
    [ 0x00, 'Success'],
    [ 0x11, 'No subscription existed'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
  ])

  return ns[0xb] = _mqtt_decode_suback(_unsuback_reason_)
}

