import { mqtt_bind_session_ctx } from './codec_bind.mjs'
import { mqtt_reader_v4 as base_reader, mqtt_reader_info } from './decode/_utils.mjs'
import { mqtt_writer_v4 } from './encode/_utils.mjs'

import { mqtt_decode_connect } from './decode/connect.mjs'
import { mqtt_decode_connack, _connack_v4 } from './decode/connack.mjs'
import { mqtt_decode_publish } from './decode/publish.mjs'
import { mqtt_decode_puback } from './decode/puback.mjs'
import { mqtt_decode_pubxxx, _pubxxx_v4 } from './decode/pubrec_pubrel_pubcomp.mjs'
import { mqtt_decode_subscribe } from './decode/subscribe.mjs'
import { mqtt_decode_suback, _suback_v4 } from './decode/suback.mjs'
import { mqtt_decode_unsubscribe } from './decode/unsubscribe.mjs'
import { mqtt_decode_unsuback, _unsuback_v4 } from './decode/unsuback.mjs'
import { mqtt_decode_pingxxx } from './decode/pingreq_pingresp.mjs'
import { mqtt_decode_disconnect } from './decode/disconnect.mjs'
// not a v4 packet: import { mqtt_decode_auth } from './decode/auth.mjs'


import { mqtt_encode_connect } from './encode/connect.mjs'
import { mqtt_encode_connack } from './encode/connack.mjs'
import { mqtt_encode_publish } from './encode/publish.mjs'
import { mqtt_encode_puback } from './encode/puback.mjs'
import { mqtt_encode_pubxxx } from './encode/pubrec_pubrel_pubcomp.mjs'
import { mqtt_encode_subscribe } from './encode/subscribe.mjs'
import { mqtt_encode_xxsuback } from './encode/suback_unsuback.mjs'
import { mqtt_encode_unsubscribe } from './encode/unsubscribe.mjs'
import { mqtt_encode_pingxxx } from './encode/pingreq_pingresp.mjs'
import { mqtt_encode_disconnect } from './encode/disconnect.mjs'
// not a v4 packet: import { mqtt_encode_auth } from './encode/auth.mjs'


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

const mqtt_ctx_v4 = /* #__PURE__ */
  mqtt_bind_session_ctx(4, mqtt_opts_v4)


export {
  mqtt_reader_v4,
  mqtt_writer_v4,

  mqtt_decode_v4,

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


  mqtt_encode_v4,

  mqtt_encode_connect,
  mqtt_encode_connack,
  mqtt_encode_publish,
  mqtt_encode_puback,
  mqtt_encode_pubxxx,
  mqtt_encode_subscribe,
  mqtt_encode_xxsuback,
  mqtt_encode_unsubscribe,
  mqtt_encode_pingxxx,

  mqtt_opts_v4,
  mqtt_ctx_v4,
  mqtt_ctx_v4 as default,
}
