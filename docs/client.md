## Bare-Bones MQTT Client

  [client/_conn.mjs]: ../code/client/_conn.mjs

```javascript
// using NodeJS
import MQTTClient from 'u8-mqtt-packet/esm/client/node.mjs'

// or using WebSockets
import MQTTClient from 'u8-mqtt-packet/esm/client/web.mjs'


const my_mqtt = new MQTTClient({on_mqtt, on_live})

// Connect using NodeJS
my_mqtt.with_tcp(1883, '127.0.0.1')

// or connect using WebSockets
my_mqtt.with_websock('ws://127.0.0.1:9001')


function on_mqtt(pkt_list, ctx) {
  const {mqtt: my_mqtt} = ctx
  for (let pkt of pkt_list) {
    console.log(`[mqtt ${pkt.type}]: %o`, pkt)
  }
}

async function on_live(my_mqtt) {
  // use mqtt.on_live to converse with the MQTT server
  await mqtt.connect({client_id: 'my-bare-bones-demo'})

  await mqtt.subscribe({topics: ['u8-mqtt-packet/+']}
}
```

See [`demo/_demo_common.mjs`](../demo/_demo_common.mjs) and
[`demo/std/demo_node.mjs`](../demo/std/demo_node.mjs) for a working example.


### Client Methods

* `constructor({on_mqtt, on_live})`

  Constructs a new MQTT bare-bones client.

  If `on_mqtt(pkt_list, ctx)` closure is provided, it is installed on the client instance to receive a list of MQTT packet objects.
  If `on_live(mqtt)` closure is provided, it is installed on the client instance and called upon transport connection.

  Packets are decoded via the internal `_conn_` and bound `_mqtt_session` objects. Please read [client/_conn.mjs][] for details.

* `mqtt.auth(pkt)` -- Encode and send an MQTT auth packet. See [`mqtt_encode_auth`](./mqtt_codec_auth.md)

* `mqtt.connect(pkt)` -- Encode and send an MQTT connect packet. See [`mqtt_encode_connect`](./mqtt_codec_connect.md)

* `mqtt.disconnect(pkt)` -- Encode and send an MQTT disconnect packet. See [`mqtt_encode_disconnect`](./mqtt_codec_disconnect.md)

* `mqtt.ping(pkt)` -- Encode and send an MQTT pingreq packet. See [`mqtt_encode_pingreq`](./mqtt_codec_pingreq_pingresp.md)

* `mqtt.subscribe(pkt)` -- Encode and send an MQTT subscribe packet. See [`mqtt_encode_subscribe`](./mqtt_codec_subscribe.md)

* `mqtt.unsubscribe(pkt)` -- Encode and send an MQTT unsubscribe packet. See [`mqtt_encode_unsubscribe`](./mqtt_codec_unsubscribe.md)

* `mqtt.puback(pkt)` -- Encode and send an MQTT puback packet. See [`mqtt_encode_puback`](./mqtt_codec_puback.md)

* `mqtt.publish(pkt)` -- Encode and send an MQTT publish packet. See [`mqtt_encode_publish`](./mqtt_codec_publish.md)

* `mqtt._send(type, pkt)` -- Encode and send an MQTT packet of `type`. See [client/_conn.mjs][] for details.

* `mqtt.on_mqtt(pkt_list, ctx)` -- Called with a list of zero or more recieved MQTT packet objects. Override or install via constructor.

* `mqtt.on_live(mqtt)` -- Called upon transport connection. Override or install via constructor.


### Web Client

* Web capable ready-to-use: `MQTTBonesWeb_v4`, `MQTTBonesWeb_v5`, bound with `mqtt_session_ctx()` suitable as a base-bones MQTT client

* `mqtt.with_websock(websock)` connects to MQTT using a WebSocket. Pass either a URL or a WebSocket instance. Returns `this`.


### NodeJS Client

* Node capable ready-to-use: `MQTTBonesNode_v4`, `MQTTBonesNode_v5`, bound with `mqtt_session_ctx()` suitable as a base-bones MQTT client

* `mqtt.with_stream(duplex_stream)` connects to MQTT using [NodeJS's duplex stream](https://nodejs.org/api/stream.html#stream_class_stream_duplex) abstraction. See `.with_tcp()` for a simple TCP connection. Returns `this`.

* `mqtt.with_tcp(...args)` invokes `.with_stream(net.connect(...args))` to connect to MQTT over a TCP socket. Returns `this`. See [NodeJS's `net.connect()`](https://nodejs.org/api/net.html#net_net_connect)


