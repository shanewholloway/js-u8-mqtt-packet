import {
  mqtt_reader_v5,
  mqtt_decode_v5,
  mqtt_writer_v5,
  mqtt_encode_v5,
  _as_mqtt_session_ctx,
} from './codec.mjs'


export default mqtt_session_ctx
export function mqtt_session_ctx(mqtt_level) {
  let {ctx} = mqtt_session_ctx
  if ( undefined === ctx ) {
    mqtt_session_ctx.ctx = ctx =
      _as_mqtt_session_ctx({
        // mqtt level 5 decoders can also decode level 4 (MQTT version 3.1.1)

        decode_fns: mqtt_decode_v5,
        mqtt_reader: mqtt_reader_v5,

        encode_fns: mqtt_encode_v5,
        mqtt_writer: mqtt_writer_v5,
      })
  }

  return ctx(mqtt_level)
}

export const mqtt_session = ()=> mqtt_session_ctx('?')()
export const mqtt_session_v4 = ()=> mqtt_session_ctx(4)()
export const mqtt_session_v5 = ()=> mqtt_session_ctx(5)()
