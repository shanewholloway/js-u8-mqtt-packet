import {
  _bind_mqtt_session_ctx,

  // Server to Client Types: connack, publish, suback
  mqtt_decode_connack,
  mqtt_decode_suback,
  mqtt_decode_publish,
  mqtt_decode_puback,

  // Client to Server Types: connect, disconnect, publish, subscribe
  mqtt_encode_connect,
  mqtt_encode_disconnect,
  mqtt_encode_publish,
  mqtt_encode_puback,
  mqtt_encode_subscribe,
} from 'u8-mqtt-packet'

export const mqtt_tiny_session =
  _bind_mqtt_session_ctx(
    [ // _tiny_decode_all:
      mqtt_decode_connack,
      mqtt_decode_suback,
      mqtt_decode_publish,
      mqtt_decode_puback,
    ],
    [ // _tiny_encode_all
      mqtt_encode_connect,
      mqtt_encode_disconnect,
      mqtt_encode_publish,
      mqtt_encode_puback,
      mqtt_encode_subscribe,
    ]
  )(4)

