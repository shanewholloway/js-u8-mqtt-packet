import { mqtt_reader_v4 as base_reader, mqtt_reader_info } from './decode/_utils.js'
import { mqtt_writer_v4 } from './encode/_utils.js'

import { mqtt_decode_connect } from './decode/connect.js'
export * from './decode/connect.js'
import { mqtt_decode_connack, _connack_v4 } from './decode/connack.js'
export * from './decode/connack.js'
import { mqtt_decode_publish } from './decode/publish.js'
export * from './decode/publish.js'
import { mqtt_decode_puback } from './decode/puback.js'
export * from './decode/puback.js'
import { mqtt_decode_pubxxx, _pubxxx_v4 } from './decode/pubrec_pubrel_pubcomp.js'
export * from './decode/pubrec_pubrel_pubcomp.js'
import { mqtt_decode_subscribe } from './decode/subscribe.js'
export * from './decode/subscribe.js'
import { mqtt_decode_suback, _suback_v4 } from './decode/suback.js'
export * from './decode/suback.js'
import { mqtt_decode_unsubscribe } from './decode/unsubscribe.js'
export * from './decode/unsubscribe.js'
import { mqtt_decode_unsuback, _unsuback_v4 } from './decode/unsuback.js'
export * from './decode/unsuback.js'
import { mqtt_decode_pingxxx } from './decode/pingreq_pingresp.js'
export * from './decode/pingreq_pingresp.js'
import { mqtt_decode_disconnect } from './decode/disconnect.js'
export * from './decode/disconnect.js'
// not a v4 packet: import { mqtt_decode_auth } from './decode/auth.js'


import { mqtt_encode_connect } from './encode/connect.js'
export * from './encode/connect.js'
import { mqtt_encode_connack } from './encode/connack.js'
export * from './encode/connack.js'
import { mqtt_encode_publish } from './encode/publish.js'
export * from './encode/publish.js'
import { mqtt_encode_puback } from './encode/puback.js'
export * from './encode/puback.js'
import { mqtt_encode_pubxxx } from './encode/pubrec_pubrel_pubcomp.js'
export * from './encode/pubrec_pubrel_pubcomp.js'
import { mqtt_encode_subscribe } from './encode/subscribe.js'
export * from './encode/subscribe.js'
import { mqtt_encode_xxsuback } from './encode/suback_unsuback.js'
export * from './encode/suback_unsuback.js'
import { mqtt_encode_unsubscribe } from './encode/unsubscribe.js'
export * from './encode/unsubscribe.js'
import { mqtt_encode_pingxxx } from './encode/pingreq_pingresp.js'
export * from './encode/pingreq_pingresp.js'
import { mqtt_encode_disconnect } from './encode/disconnect.js'
export * from './encode/disconnect.js'
// not a v4 packet: import { mqtt_encode_auth } from './encode/auth.js'


const mqtt_reader_v4 = /* #__PURE__ */
  mqtt_reader_info(
    base_reader,
    _connack_v4,
    _pubxxx_v4,
    _suback_v4,
    _unsuback_v4,
  )

const mqtt_decode_v4 = /* #__PURE__ */ [
  mqtt_decode_connect,
  mqtt_decode_connack,
  mqtt_decode_publish,
  mqtt_decode_puback,
  mqtt_decode_pubxxx,
  mqtt_decode_subscribe,
  mqtt_decode_suback,
  mqtt_decode_unsubscribe,
  mqtt_decode_unsuback,
  mqtt_decode_pingxxx,
  mqtt_decode_disconnect,
]


const mqtt_encode_v4 = /* #__PURE__ */ [
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


const mqtt_opts_v4 = /* #__PURE__ */
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
