import { mqtt_reader_v4 as base_reader, mqtt_reader_info } from './decode/_utils.js'
import { mqtt_writer_v4 } from './encode/_utils.js'
import { mqtt_decode_v4, mqtt_encode_v4 } from './codec_v4_lean.js'

import { _connack_v4 } from './decode/connack.js'
import { _suback_v4 } from './decode/suback.js'
import { _unsuback_v4 } from './decode/unsuback.js'

const mqtt_reader_v4 = /* #__PURE__ */
  mqtt_reader_info(
    base_reader,
    _connack_v4,
    _suback_v4,
    _unsuback_v4,
  )

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
