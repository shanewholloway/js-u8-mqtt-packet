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

```javascript
import {mqtt_session_v4} from 'u8-mqtt-packet'
const [mqtt_decode, mqtt_encode] = mqtt_session_v4()

const u8_pkt = mqtt_encode('connect', {
  keep_alive: 60,
  flags: 0,
  client_id: 'readme',
})

console.log(u8_pkt)

/*
  Uint8Array(20) [16,18,0,4,77,81,84,84,4,0,0,60,0,6,114,101,97,100,109,101]
*/


console.log(mqtt_decode(u8_pkt))

/*
  [
    {
      b0: 16,
      mqtt_level: 4,
      flags: [Number (_connect_flags_): 0],
      keep_alive: 60,
      client_id: 'readme'
    }
  ]
*/
```

## License

[BSD-2-Clause](LICENSE)

