import { mqtt_bind_session_ctx } from './codec_bind.mjs'
import { mqtt_reader_v5 as base_reader, mqtt_reader_info } from './decode/_utils.mjs'
import { mqtt_writer_v5 } from './encode/_utils.mjs'
import { mqtt_decode_v5, mqtt_encode_v5 } from './codec_v5_lean.mjs'

import { _connack_v5 } from './decode/connack.mjs'
import { _puback_v5 } from './decode/puback.mjs'
import { _suback_v5 } from './decode/suback.mjs'
import { _unsuback_v5 } from './decode/unsuback.mjs'
import { _disconnect_v5 } from './decode/disconnect.mjs'
import { _auth_v5 } from './decode/auth.mjs'

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

const mqtt_ctx_v4 = /* #__PURE__ */
  mqtt_bind_session_ctx(4, mqtt_opts_v5)
const mqtt_ctx_v5 = /* #__PURE__ */
  mqtt_bind_session_ctx(5, mqtt_opts_v5)


export {
  mqtt_reader_v5,
  mqtt_writer_v5,
  mqtt_decode_v5,
  mqtt_encode_v5,

  mqtt_opts_v5,
  mqtt_ctx_v4,
  mqtt_ctx_v5,
  mqtt_ctx_v5 as default,
}
