## Bare-Bones MQTT Client

  [client/_conn.mjs]: ../code/client/_conn.mjs

* `constructor(on_mqtt : function(pkt_list, ctx))`

  Constructs a new MQTT bare-bones client. If `on_mqtt` closure is provided, it is installed on the client instance to receive lists of MQTT packet objects.

  Packets are decoded via the internal `_conn_` and bound `mqtt_session` objects. Please read [client/_conn.mjs][] for details.

* `mqtt.auth(pkt)` -- Encode and send an MQTT auth packet. See `[mqtt_encode_auth](./mqtt_codec_auth.md)`

* `mqtt.connect(pkt)` -- Encode and send an MQTT connect packet. See `[mqtt_encode_connect](./mqtt_codec_connect.md)`

* `mqtt.disconnect(pkt)` -- Encode and send an MQTT disconnect packet. See `[mqtt_encode_disconnect](./mqtt_codec_disconnect.md)`

* `mqtt.ping(pkt)` -- Encode and send an MQTT pingreq packet. See `[mqtt_encode_pingreq](./mqtt_codec_pingreq_pingresp.md)`

* `mqtt.subscribe(pkt)` -- Encode and send an MQTT subscribe packet. See `[mqtt_encode_subscribe](./mqtt_codec_subscribe.md)`

* `mqtt.unsubscribe(pkt)` -- Encode and send an MQTT unsubscribe packet. See `[mqtt_encode_unsubscribe](./mqtt_codec_unsubscribe.md)`

* `mqtt.puback(pkt)` -- Encode and send an MQTT puback packet. See `[mqtt_encode_puback](./mqtt_codec_puback.md)`

* `mqtt.publish(pkt)` -- Encode and send an MQTT publish packet. See `[mqtt_encode_publish](./mqtt_codec_publish.md)`

* `mqtt._send(type, pkt)` -- Encode and send an MQTT packet of `type`. See [client/_conn.mjs][] for details.


### Web Client

* Web capable ready-to-use: `MQTTBonesWeb_v4`, `MQTTBonesWeb_v5`, bound with `mqtt_session_ctx()` suitable as a base-bones MQTT client

* `MQTTBonesWebClient::with_websock(websock)` connects to MQTT over websocket protocol. Pass either a websocket URL or a WebSocket instance.


### NodeJS Client

* Node capable ready-to-use: `MQTTBonesNode_v4`, `MQTTBonesNode_v5`, bound with `mqtt_session_ctx()` suitable as a base-bones MQTT client

* `MQTTBonesNodeClient::with_stream(duplex_stream)` connects to MQTT using [NodeJS's duplex stream](https://nodejs.org/api/stream.html#stream_class_stream_duplex) abstraction. See `.with_tcp()` for a simple TCP connection.

* `MQTTBonesNodeClient::with_tcp(...args)` invokes `.with_stream(net.connect(...args))` to connect to MQTT over a TCP socket. See [NodeJS's `net.connect()`](https://nodejs.org/api/net.html#net_net_connect)


