import { mqtt_reader_v4 } from './mqtt_delux_v4.js'
import { mqtt_writer_v4 } from './mqtt_writer.js'
export * from './mqtt_delux_v4.js'
export * from './mqtt_writer.js'

import { mqtt_encode_connect, mqtt_decode_connect } from './pkt/connect.js'
export * from './pkt/connect.js'
import { mqtt_encode_connack, mqtt_decode_connack } from './pkt/connack.js'
export * from './pkt/connack.js'
import { mqtt_encode_publish, mqtt_decode_publish } from './pkt/publish.js'
export * from './pkt/publish.js'
import { mqtt_encode_puback, mqtt_decode_puback } from './pkt/puback.js'
export * from './pkt/puback.js'
import { mqtt_encode_pubxxx, mqtt_decode_pubxxx } from './pkt/pubrec_pubrel_pubcomp.js'
export * from './pkt/pubrec_pubrel_pubcomp.js'
import { mqtt_encode_subscribe, mqtt_decode_subscribe } from './pkt/subscribe.js'
export * from './pkt/subscribe.js'
import { mqtt_encode_xxsuback, mqtt_decode_xxsuback } from './pkt/suback_unsuback.js'
export * from './pkt/suback_unsuback.js'
import { mqtt_encode_unsubscribe, mqtt_decode_unsubscribe } from './pkt/unsubscribe.js'
export * from './pkt/unsubscribe.js'
import { mqtt_encode_pingxxx, mqtt_decode_pingxxx } from './pkt/pingreq_pingresp.js'
export * from './pkt/pingreq_pingresp.js'
import { mqtt_encode_disconnect, mqtt_decode_disconnect } from './pkt/disconnect.js'
export * from './pkt/disconnect.js'
// not a v4 packet: import { mqtt_encode_auth, mqtt_decode_auth } from './pkt/auth.js'


const mqtt_decode_v4 = [
  mqtt_decode_connect,
  mqtt_decode_connack,
  mqtt_decode_publish,
  mqtt_decode_puback,
  mqtt_decode_pubxxx,
  mqtt_decode_subscribe,
  mqtt_decode_xxsuback,
  mqtt_decode_unsubscribe,
  mqtt_decode_pingxxx,
  mqtt_decode_disconnect,
]


const mqtt_encode_v4 = [
  mqtt_encode_connect,
  mqtt_encode_connack,
  mqtt_encode_publish,
  mqtt_encode_puback,
  mqtt_encode_pubxxx,
  mqtt_encode_subscribe,
  mqtt_encode_xxsuback,
  mqtt_encode_unsubscribe,
  mqtt_encode_pingxxx,
  mqtt_encode_disconnect,
]


const mqtt_opts_v4 =
  { decode_fns: mqtt_decode_v4,
    mqtt_reader: mqtt_reader_v4,
    encode_fns: mqtt_encode_v4,
    mqtt_writer: mqtt_writer_v4, }


export * from './version.js'
export {
  mqtt_reader_v4,
  mqtt_writer_v4,
  mqtt_decode_v4,
  mqtt_encode_v4,
  mqtt_opts_v4,
  mqtt_opts_v4 as default,
}
