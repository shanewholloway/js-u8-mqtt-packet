import { mqtt_reader_v5 } from './mqtt_reader.js'
import { mqtt_writer_v5 } from './mqtt_writer.js'
import { mqtt_decode_v5, mqtt_encode_v5 } from './codec_v5_client.js'
export * from './mqtt_props.js'


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
