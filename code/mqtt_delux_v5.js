import { mqtt_reader_v5 as base_v5 } from './mqtt_reader_lean.js'
import { with_reasons, reasons_v4 } from './mqtt_delux_v4.js'

export { with_reasons, reasons_v4 }

export const reasons_v5 = {
  ... reasons_v4,
  auth: [
    [ 0x18, 'continue authentication' ],
    [ 0x19, 're-authenticate' ],
  ],
  disconnect: [
    [ 0x04, 'disconnect with will message'],
  ],
  all: [
    ... reasons_v4.all,
    [ 0x81, 'malformed packet'], // connack disconnect
    [ 0x82, 'protocol error'], // connack disconnect
    [ 0x84, 'unsupported protocol version'], // connack
    [ 0x85, 'client identifier not valid'], // connack
    [ 0x86, 'bad user name or password'], // connack
    [ 0x88, 'server unavailable'], // connack
    [ 0x89, 'server busy'], // connack disconnect
    [ 0x8A, 'banned'], // connack
    [ 0x8B, 'server shutting down'], // disconnect
    [ 0x8C, 'bad authentication method'], // connack
    [ 0x8D, 'keep alive timeout'], // disconnect
    [ 0x8E, 'session taken over'], // disconnect
    [ 0x90, 'topic name invalid'], // connack disconnect puback
    [ 0x93, 'receive maximum exceeded'], // disconnect
    [ 0x94, 'topic alias invalid'], // disconnect
    [ 0x95, 'packet too large'], // connack disconnect
    [ 0x96, 'message rate too high'], // disconnect
    [ 0x97, 'quota exceeded'], // connack disconnect puback suback
    [ 0x98, 'administrative action'], // disconnect
    [ 0x99, 'payload format invalid'], // connack disconnect puback
    [ 0x9A, 'retain not supported'], // connack disconnect
    [ 0x9B, 'qoS not supported'], // connack disconnect
    [ 0x9C, 'use another server'], // connack disconnect
    [ 0x9D, 'server moved'], // connack disconnect
    [ 0x9E, 'shared subscriptions not supported'], // disconnect suback
    [ 0x9F, 'connection rate exceeded'], // connack disconnect
    [ 0xA0, 'maximum connect time'], // disconnect
    [ 0xA1, 'subscription identifiers not supported'], // disconnect suback
    [ 0xA2, 'wildcard subscriptions not supported'], // disconnect suback
  ]}

export const mqtt_reader_v5 = /* #__PURE__ */
  with_reasons(base_v5, reasons_v5)

