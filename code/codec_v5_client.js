import { mqtt_reader_v5 as base_reader, mqtt_reader_info } from './decode/_utils.js'
import { mqtt_writer_v5 } from './encode/_utils.js'
import { mqtt_decode_v5, mqtt_encode_v5 } from './codec_v5_lean.js'

import { _connack_v5 } from './decode/connack.js'
import { _puback_v5 } from './decode/puback.js'
import { _suback_v5 } from './decode/suback.js'
import { _unsuback_v5 } from './decode/unsuback.js'
import { _disconnect_v5 } from './decode/disconnect.js'
import { _auth_v5 } from './decode/auth.js'

const mqtt_reader_v5 = /* #__PURE__ */
  mqtt_reader_info(
    base_reader,
    _connack_v5,
    _puback_v5,
    _suback_v5,
    _unsuback_v5,
    _disconnect_v5,
    _auth_v5,
  )


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
