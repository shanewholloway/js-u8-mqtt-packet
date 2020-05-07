# u8-mqtt-packet

MQTT packet encoder and decoder using Uint8Array in ES Modules (ESM). Zero dependencies. [Tree-shaking friendly](https://rollupjs.org/guide/en/).
Suited for use in modern ES6 environments: the Browser, [NodeJS](https://nodejs.org/en/), and [Deno](https://deno.land/).

Compare with:

| Size in KB | Measurement |
|------------|-------------|
|     187 KB | `curl -sL https://cdn.jsdelivr.net/npm/mqtt@4.0.1/dist/mqtt.min.js  | wc -c`
|      32 KB | `curl -sL https://cdn.jsdelivr.net/npm/paho-mqtt@1.1.0/paho-mqtt.min.js | wc -c`
|      14 KB | `cat ./u8-mqtt-packet/esm/client/web.min.mjs | wc -c`
|      15 KB | `cat ./u8-mqtt/esm/web/v4.min.mjs | wc -c`
|------------|-------------|


Use [u8-mqtt][] for a MQTT client for QOS-0 and QOS-1 communications.

 [u8-mqtt]: https://github.com/shanewholloway/js-u8-mqtt

## Docs

- [API docs](./docs/api.md)
- [Bare-bones Client docs](./docs/client.md) -- `import 'esm/client/web.min.mjs'` for 14 KB 
- See [u8-mqtt][] for a more friendly MQTT client using this library. (for 16 KB)



Targeting [MQTT-3.1.1 (v4)][spec-3.1.1] and [MQTT-5.0.0 (v5)][spec-5.0.0] compatibility.

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

## Prior Art

The `u8-mqtt-packet` project was inspired by [mqtt-packet](https://github.com/mqttjs/mqtt-packet) written for NodeJS. The codecs of that project are written with a NodeJS ecosystem in mind: Buffer, EventEmitter, Streams.


## License

[BSD-2-Clause](LICENSE)

