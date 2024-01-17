import { mqtt_reader_v5 } from './decode/_utils.js'
import { mqtt_writer_v5 } from './encode/_utils.js'
export * from './mqtt_props.js'

// redundant for client: import { mqtt_decode_connect } from './decode/connect.js'
import { mqtt_decode_connack } from './decode/connack.js'
import { mqtt_decode_publish } from './decode/publish.js'
import { mqtt_decode_puback } from './decode/puback.js'
// not using QOS2: import { mqtt_decode_pubxxx } from './decode/pubrec_pubrel_pubcomp.js'
// redundant for client: import { mqtt_decode_subscribe } from './decode/subscribe.js'
import { mqtt_decode_suback } from './decode/suback.js'
// redundant for client: import { mqtt_decode_unsubscribe } from './decode/unsubscribe.js'
import { mqtt_decode_unsuback } from './decode/unsuback.js'
import { mqtt_decode_pingxxx } from './decode/pingreq_pingresp.js'
import { mqtt_decode_disconnect } from './decode/disconnect.js'
import { mqtt_decode_auth } from './decode/auth.js'


import { mqtt_encode_connect } from './encode/connect.js'
// redundant for client: import { mqtt_encode_connack } from './encode/connack.js'
import { mqtt_encode_publish } from './encode/publish.js'
import { mqtt_encode_puback } from './encode/puback.js'
// not using QOS2: import { mqtt_encode_pubxxx } from './encode/pubrec_pubrel_pubcomp.js'
import { mqtt_encode_subscribe } from './encode/subscribe.js'
// redundant for client: import { mqtt_encode_xxsuback } from './encode/suback_unsuback.js'
import { mqtt_encode_unsubscribe } from './encode/unsubscribe.js'
import { mqtt_encode_pingxxx } from './encode/pingreq_pingresp.js'
import { mqtt_encode_disconnect } from './encode/disconnect.js'
import { mqtt_encode_auth } from './encode/auth.js'


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

export * from './version.js'
export {
  mqtt_reader_v5,
  mqtt_writer_v5,
  mqtt_decode_v5,
  mqtt_encode_v5,
  mqtt_opts_v5,
  mqtt_opts_v5 as default,
}
