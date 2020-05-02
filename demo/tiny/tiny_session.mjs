import {
  _mqtt_pkt_id_dispatch,
  _mqtt_bind_encode,
  _bind_mqtt_session,
  _mqtt_std_pkt_api,

  // Server to Client Types: connack, publish, suback
  mqtt_decode_noop as noop,
  mqtt_decode_connack,
  mqtt_decode_suback,
  mqtt_decode_publish,

  // Client to Server Types: connect, disconnect, publish, subscribe
  mqtt_encode_connect as connect,
  mqtt_encode_disconnect as disconnect,
  mqtt_encode_publish as publish,
  mqtt_encode_subscribe as subscribe,
} from 'u8-mqtt-packet'

const ops_by_id = Array(17).fill(noop)
ops_by_id[0x2] = mqtt_decode_connack
ops_by_id[0x3] = mqtt_decode_publish
ops_by_id[0x9] = mqtt_decode_suback

export const mqtt_decode_session =
  _mqtt_pkt_id_dispatch(ops_by_id)

export const mqtt_encode_session =
  _mqtt_bind_encode({
    connect,
    disconnect,
    publish,
    subscribe,
  })

export const mqtt_tiny_session =
  _bind_mqtt_session(
    {mqtt_level: 4, ... _mqtt_std_pkt_api},
    mqtt_decode_session,
    mqtt_encode_session)

export default mqtt_tiny_session

