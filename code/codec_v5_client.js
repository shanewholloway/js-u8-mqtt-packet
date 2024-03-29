import { mqtt_reader_v5 } from './mqtt_delux_v5.js'
import { mqtt_writer_v5 } from './mqtt_writer.js'
export * from './mqtt_props.js'

// redundant for client: import { mqtt_decode_connect } from './pkt/connect.js'
import { mqtt_encode_connect } from './pkt/connect.js'
// redundant for client: import { mqtt_encode_connack } from './pkt/connack.js'
import { mqtt_decode_connack } from './pkt/connack.js'
import { mqtt_encode_publish, mqtt_decode_publish } from './pkt/publish.js'
import { mqtt_encode_puback, mqtt_decode_puback } from './pkt/puback.js'
// not using QOS2: import { mqtt_encode_pubxxx, mqtt_decode_pubxxx } from './pkt/pubrec_pubrel_pubcomp.js'
// redundant for client: import { mqtt_decode_subscribe } from './pkt/subscribe.js'
import { mqtt_encode_subscribe } from './pkt/subscribe.js'
// redundant for client: import { mqtt_encode_xxsuback } from './pkt/suback_unsuback.js'
import { mqtt_decode_xxsuback } from './pkt/suback_unsuback.js'
// redundant for client: import { mqtt_decode_unsubscribe } from './pkt/unsubscribe.js'
import { mqtt_encode_unsubscribe } from './pkt/unsubscribe.js'
import { mqtt_encode_pingxxx, mqtt_decode_pingxxx } from './pkt/pingreq_pingresp.js'
import { mqtt_encode_disconnect, mqtt_decode_disconnect } from './pkt/disconnect.js'
import { mqtt_encode_auth, mqtt_decode_auth } from './pkt/auth.js'


const mqtt_decode_v5 = /* #__PURE__ */ [
  mqtt_decode_connack,
  mqtt_decode_publish,
  mqtt_decode_puback,
  mqtt_decode_xxsuback,
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
