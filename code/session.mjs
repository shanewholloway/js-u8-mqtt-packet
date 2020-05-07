import {
  mqtt_decode_zero,
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
  mqtt_decode_auth,

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
  mqtt_encode_auth,

  _bind_mqtt_session_ctx,
} from './codec.mjs'


export default mqtt_session_ctx
export function mqtt_session_ctx(mqtt_level) {
  let {ctx} = mqtt_session_ctx
  if ( undefined === ctx ) {
    mqtt_session_ctx.ctx = ctx =
      _bind_mqtt_session_ctx(
        [ // lst_decode_ops = [
          mqtt_decode_zero,
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
          mqtt_decode_auth, ],
        [ // lst_encode_ops = [
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
          mqtt_encode_auth, ])
  }

  return ctx(mqtt_level)
}

export const mqtt_session_v4 = ()=> mqtt_session_ctx(4)()
export const mqtt_session_v5 = ()=> mqtt_session_ctx(5)()
