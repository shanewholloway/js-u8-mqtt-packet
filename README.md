# u8-mqtt-packet

MQTT packet encoder and decoder using Uint8Array -- suitable for use in the
browser, nodejs, and deno. Zero dependencies. ESM / Tree-shaking friendly.

Targeting [MQTT-3.1.1][spec-3.1.1] and [MQTT-5.0.0][spec-5.0.0] compatibility.

This project was inspired by [mqtt-packet](https://github.com/mqttjs/mqtt-packet)
written for NodeJS. Their codecs are written with a NodeJS ecosystem in mind:
Buffer, EventEmitter, Streams.


 [spec-5.0.0]: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
 [spec-3.1.1]: http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html


## Use

### Session Codec Client

```javascript
import {mqtt_session} from 'u8-mqtt-packet'

const [mqtt_decode, mqtt_encode] = mqtt_session()
```

```javascript
import {mqtt_encode_session} from 'u8-mqtt-packet'
const mqtt_encode = mqtt_encode_session(4)

const u8_pkt = mqtt_encode('connect', {
  keep_alive: 60,
  connect_flags: 0,
  payload: { client_id: 'readme' },
})

console.log(u8_pkt)

/*
  Uint8Array(20) [16,18,0,4,77,81,84,84,4,0,0,60,0,6,114,101,97,100,109,101]
*/


import {mqtt_decode_session} from 'u8-mqtt-packet'
const mqtt_decode = mqtt_decode_session()
const pkt_list = mqtt_decode(u8_pkt)
console.log(pkt_list)

/*
  [
    {
      b0: 16,
      cmd: 16,
      hdr: 0,
      type_obj: { type: 'connect', cmd: 16, id: 1 },
      u8_body: Uint8Array(18) [
         0,   4,  77,  81, 84,  84,   4,
         0,   0,  60,   0,  6, 114, 101,
        97, 100, 109, 101
      ],
      mqtt_level: 4,
      connect_flags: [Number (_connect_flags_): 0],
      keep_alive: 60,
      payload: { client_id: 'readme' }
    }
  ]
*/
```

### Basic Client

```javascript
// using NodeJS
import {connect} from 'net'
import MQTTClient from 'u8-mqtt-packet/esm/client/node.mjs'

// or using WebSockets
import MQTTClient from 'u8-mqtt-packet/esm/client/web.mjs'


const my_mqtt = new MQTTClient( pkt_list => {

    for (const pkt of pkt_list) {
      const {type_obj, u8_body, b0, cmd, ... tip} = pkt
      console.log(`%c[mqtt ${type_obj.type}]: %o`, 'color: blue', tip)
    }
  })


// Connect using NodeJS
my_mqtt.with_stream(connect(1883, '127.0.0.1'))
  .then(somewhere_in_your_code)

// or connect using WebSockets
my_mqtt.with_websock('ws://127.0.0.1:9001')
  .then(somewhere_in_your_code)
  

function somewhere_in_your_code() {

  my_mqtt.connect({
    keep_alive: 60,
    connect_flags: { will_flag: 1, will_qos: 0, },
    payload: {
      client_id: 'swh_demo',
      will_topic: 'swh/aaa/awesome',
      will_payload: 'will is awesome',
    },
  })

  my_mqtt.publish({
    topic: 'swh/test-topic',
    payload: 'awesome from web',
  })

}
```

## License

[BSD-2-Clause](LICENSE)

