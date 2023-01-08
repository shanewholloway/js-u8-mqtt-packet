import { mqtt_reader_v5 as base_reader, mqtt_reader_info } from './decode/_utils.mjs'
import { mqtt_writer_v5 } from './encode/_utils.mjs'

import { mqtt_decode_connect } from './decode/connect.mjs'
export * from './decode/connect.mjs'
import { mqtt_decode_connack, _connack_v5 } from './decode/connack.mjs'
export * from './decode/connack.mjs'
import { mqtt_decode_publish } from './decode/publish.mjs'
export * from './decode/publish.mjs'
import { mqtt_decode_puback, _puback_v5 } from './decode/puback.mjs'
export * from './decode/puback.mjs'
import { mqtt_decode_pubxxx, _pubxxx_v5 } from './decode/pubrec_pubrel_pubcomp.mjs'
export * from './decode/pubrec_pubrel_pubcomp.mjs'
import { mqtt_decode_subscribe } from './decode/subscribe.mjs'
export * from './decode/subscribe.mjs'
import { mqtt_decode_suback, _suback_v5 } from './decode/suback.mjs'
export * from './decode/suback.mjs'
import { mqtt_decode_unsubscribe } from './decode/unsubscribe.mjs'
export * from './decode/unsubscribe.mjs'
import { mqtt_decode_unsuback, _unsuback_v5 } from './decode/unsuback.mjs'
export * from './decode/unsuback.mjs'
import { mqtt_decode_pingxxx } from './decode/pingreq_pingresp.mjs'
export * from './decode/pingreq_pingresp.mjs'
import { mqtt_decode_disconnect, _disconnect_v5 } from './decode/disconnect.mjs'
export * from './decode/disconnect.mjs'
import { mqtt_decode_auth, _auth_v5 } from './decode/auth.mjs'
export * from './decode/auth.mjs'


import { mqtt_encode_connect } from './encode/connect.mjs'
export * from './encode/connect.mjs'
import { mqtt_encode_connack } from './encode/connack.mjs'
export * from './encode/connack.mjs'
import { mqtt_encode_publish } from './encode/publish.mjs'
export * from './encode/publish.mjs'
import { mqtt_encode_puback } from './encode/puback.mjs'
export * from './encode/puback.mjs'
import { mqtt_encode_pubxxx } from './encode/pubrec_pubrel_pubcomp.mjs'
export * from './encode/pubrec_pubrel_pubcomp.mjs'
import { mqtt_encode_subscribe } from './encode/subscribe.mjs'
export * from './encode/subscribe.mjs'
import { mqtt_encode_xxsuback } from './encode/suback_unsuback.mjs'
export * from './encode/suback_unsuback.mjs'
import { mqtt_encode_unsubscribe } from './encode/unsubscribe.mjs'
export * from './encode/unsubscribe.mjs'
import { mqtt_encode_pingxxx } from './encode/pingreq_pingresp.mjs'
export * from './encode/pingreq_pingresp.mjs'
import { mqtt_encode_disconnect } from './encode/disconnect.mjs'
export * from './encode/disconnect.mjs'
import { mqtt_encode_auth } from './encode/auth.mjs'
export * from './encode/auth.mjs'


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

export * from './version.mjs'
export {
  mqtt_reader_v5,
  mqtt_writer_v5,
  mqtt_decode_v5,
  mqtt_encode_v5,
  mqtt_opts_v5,
  mqtt_opts_v5 as default,
}
