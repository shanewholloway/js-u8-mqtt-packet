import { mqtt_reader_v5 as base_reader, mqtt_reader_info } from './decode/_utils.js'
import { mqtt_writer_v5 } from './encode/_utils.js'

import { mqtt_decode_connect } from './decode/connect.js'
export * from './decode/connect.js'
import { mqtt_decode_connack, _connack_v5 } from './decode/connack.js'
export * from './decode/connack.js'
import { mqtt_decode_publish } from './decode/publish.js'
export * from './decode/publish.js'
import { mqtt_decode_puback, _puback_v5 } from './decode/puback.js'
export * from './decode/puback.js'
import { mqtt_decode_pubxxx, _pubxxx_v5 } from './decode/pubrec_pubrel_pubcomp.js'
export * from './decode/pubrec_pubrel_pubcomp.js'
import { mqtt_decode_subscribe } from './decode/subscribe.js'
export * from './decode/subscribe.js'
import { mqtt_decode_suback, _suback_v5 } from './decode/suback.js'
export * from './decode/suback.js'
import { mqtt_decode_unsubscribe } from './decode/unsubscribe.js'
export * from './decode/unsubscribe.js'
import { mqtt_decode_unsuback, _unsuback_v5 } from './decode/unsuback.js'
export * from './decode/unsuback.js'
import { mqtt_decode_pingxxx } from './decode/pingreq_pingresp.js'
export * from './decode/pingreq_pingresp.js'
import { mqtt_decode_disconnect, _disconnect_v5 } from './decode/disconnect.js'
export * from './decode/disconnect.js'
import { mqtt_decode_auth, _auth_v5 } from './decode/auth.js'
export * from './decode/auth.js'


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
import { mqtt_encode_auth } from './encode/auth.js'
export * from './encode/auth.js'


const mqtt_reader_v5 = /* #__PURE__ */
  mqtt_reader_info(
    base_reader,
    _connack_v5,
    _puback_v5,
    _pubxxx_v5,
    _suback_v5,
    _unsuback_v5,
    _disconnect_v5,
    _auth_v5,
  )

const mqtt_decode_v5 = /* #__PURE__ */ [
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
  mqtt_decode_auth,
]


const mqtt_encode_v5 = /* #__PURE__ */ [
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
  mqtt_encode_auth,
]


const mqtt_opts_v5 = /* #__PURE__ */
  { decode_fns: mqtt_decode_v5,
    mqtt_reader: mqtt_reader_v5,
    encode_fns: mqtt_encode_v5,
    mqtt_writer: mqtt_writer_v5, }

export * from './version.js'
export {
  mqtt_reader_v5,
  mqtt_writer_v5,
  mqtt_decode_v5,
  mqtt_encode_v5,
  mqtt_opts_v5,
  mqtt_opts_v5 as default,
}
