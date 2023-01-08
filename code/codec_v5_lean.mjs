import { mqtt_reader_v5 } from './decode/_utils.mjs'
import { mqtt_writer_v5 } from './encode/_utils.mjs'

// redundant for client: import { mqtt_decode_connect } from './decode/connect.mjs'
import { mqtt_decode_connack } from './decode/connack.mjs'
import { mqtt_decode_publish } from './decode/publish.mjs'
import { mqtt_decode_puback } from './decode/puback.mjs'
// not using QOS2: import { mqtt_decode_pubxxx } from './decode/pubrec_pubrel_pubcomp.mjs'
// redundant for client: import { mqtt_decode_subscribe } from './decode/subscribe.mjs'
import { mqtt_decode_suback } from './decode/suback.mjs'
// redundant for client: import { mqtt_decode_unsubscribe } from './decode/unsubscribe.mjs'
import { mqtt_decode_unsuback } from './decode/unsuback.mjs'
import { mqtt_decode_pingxxx } from './decode/pingreq_pingresp.mjs'
import { mqtt_decode_disconnect } from './decode/disconnect.mjs'
import { mqtt_decode_auth } from './decode/auth.mjs'


import { mqtt_encode_connect } from './encode/connect.mjs'
// redundant for client: import { mqtt_encode_connack } from './encode/connack.mjs'
import { mqtt_encode_publish } from './encode/publish.mjs'
import { mqtt_encode_puback } from './encode/puback.mjs'
// not using QOS2: import { mqtt_encode_pubxxx } from './encode/pubrec_pubrel_pubcomp.mjs'
import { mqtt_encode_subscribe } from './encode/subscribe.mjs'
// redundant for client: import { mqtt_encode_xxsuback } from './encode/suback_unsuback.mjs'
import { mqtt_encode_unsubscribe } from './encode/unsubscribe.mjs'
import { mqtt_encode_pingxxx } from './encode/pingreq_pingresp.mjs'
import { mqtt_encode_disconnect } from './encode/disconnect.mjs'
import { mqtt_encode_auth } from './encode/auth.mjs'


const mqtt_decode_v5 = /* #__PURE__ */ [
  mqtt_decode_connack,
  mqtt_decode_publish,
  mqtt_decode_puback,
  mqtt_decode_suback,
  mqtt_decode_unsuback,
  mqtt_decode_pingxxx,
  mqtt_decode_disconnect,
  mqtt_decode_auth,
]


const mqtt_encode_v5 = /* #__PURE__ */ [
  mqtt_encode_connect,
  mqtt_encode_puback,
  mqtt_encode_publish,
  mqtt_encode_subscribe,
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

export {
  mqtt_reader_v5,
  mqtt_writer_v5,
  mqtt_decode_v5,
  mqtt_encode_v5,
  mqtt_opts_v5,
  mqtt_opts_v5 as default,
}
