import { mqtt_reader_v4 as base_reader, mqtt_reader_info } from './decode/_utils.mjs'
import { mqtt_writer_v4 } from './encode/_utils.mjs'
import { mqtt_decode_v4, mqtt_encode_v4 } from './codec_v4_lean.mjs'

import { _connack_v4 } from './decode/connack.mjs'
import { _suback_v4 } from './decode/suback.mjs'
import { _unsuback_v4 } from './decode/unsuback.mjs'

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

export { version } from '../package.json'
export {
  mqtt_reader_v4,
  mqtt_writer_v4,
  mqtt_decode_v4,
  mqtt_encode_v4,
  mqtt_opts_v4,
  mqtt_opts_v4 as default,
}
