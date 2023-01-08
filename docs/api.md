### MQTT Packets

#### Decoders

MQTT decoders are of the form `(pkt, u8_body) => pkt` where `pkt` is a prototype object created by `{__proto__: _pkt_ctx_, b0}`, the `u8_body` is a `Uint8Array` that encodes the MQTT packet body.

Each decoder will round-trip a `Uint8Array` raw packet buffer created by the corresponding `mqtt_encode_xxx(mqtt_level, pkt)` encoder.

To facilitate simple and correct use, each `mqtt_decode_xxx(ns, mqtt_reader)` function accepts a namespace array where the decoder is assigned by MQTT command id (`b0 >>> 4`).


#### Encoders

MQTT encoders are of the form `(mqtt_level, pkt) => u8_pkt` where `pkt` is an object and the returned `u8_pkt` is a `Uint8Array` that encodes the MQTT packet.

Each encoder will round-trip a `pkt` object created by the corresponding `mqtt_decode_xxx({b0}, u8_body)` decoder.

To facilitate simple and correct use, the `mqtt_encode_xxx(ns, mqtt_writer)` function accepts a namespace object where the encoder is installed by MQTT command name.


#### Version 5 Properties

[MQTT Version 5 properties](./mqtt_props.md)


#### Bundles

- MQTT v5 packet encoding/decoding including v4 (3.1.1) support
  - Default: `import 'u8-mqtt-packet'` exports everything from `codex_v5_full.js`
  - Everything for server and client: `import 'u8-mqtt-packet/esm/codex_v5_full.js'`
  - Only client support: `import 'u8-mqtt-packet/esm/codex_v5_lean.js'`
  - Only client support with debug strings: `import 'u8-mqtt-packet/esm/codex_v5_client.js'`

- MQTT v4 (3.1.1) packet encoding/decoding, **excluding** v5 support
  - Everything for server and client: `import 'u8-mqtt-packet/esm/codex_v4_full.js'`
  - Only client support: `import 'u8-mqtt-packet/esm/codex_v4_lean.js'`
  - Only client support with debug strings: `import 'u8-mqtt-packet/esm/codex_v4_client.js'`


#### Specific Packets

* `reserved [0x0]: mqtt_decode_zero` should only be encountered in error.
* [`connect [0x1]: mqtt_decode_connect / mqtt_encode_connect`](./mqtt_codec_connect.md)
* [`connack [0x2]: mqtt_decode_connack / mqtt_encode_connack`](./mqtt_codec_connack.md)
* [`publish [0x3]: mqtt_decode_publish / mqtt_encode_publish`](./mqtt_codec_publish.md)
* [`puback [0x4]: mqtt_decode_puback / mqtt_encode_puback`](./mqtt_codec_puback.md)
* [`pubrec [0x5]: mqtt_decode_pubxxx / mqtt_encode_pubxxx`](./mqtt_codec_pubrec_pubrel_pubcomp.md)
* [`pubrel [0x6]: mqtt_decode_pubxxx / mqtt_encode_pubxxx`](./mqtt_codec_pubrec_pubrel_pubcomp.md)
* [`pubcomp [0x7]: mqtt_decode_pubxxx / mqtt_encode_pubxxx`](./mqtt_codec_pubrec_pubrel_pubcomp.md)
* [`subscribe [0x8]: mqtt_decode_subscribe / mqtt_encode_subscribe`](./mqtt_codec_subscribe.md)
* [`suback [0x9]: mqtt_decode_suback / mqtt_encode_xxsuback`](./mqtt_codec_suback.md)
* [`unsubscribe [0xa]: mqtt_decode_unsubscribe / mqtt_encode_unsubscribe`](./mqtt_codec_unsubscribe.md)
* [`unsuback [0xb]: mqtt_decode_unsuback / mqtt_encode_xxsuback`](./mqtt_codec_unsuback.md)
* [`pingreq [0xc]: mqtt_decode_pingxxx / mqtt_encode_pingxxx`](./mqtt_codec_pingreq_pingresp.md)
* [`pingresp [0xd]: mqtt_decode_pingxxx / mqtt_encode_pingxxx`](./mqtt_codec_pingreq_pingresp.md)
* [`disconnect [0xe]: mqtt_decode_disconnect / mqtt_encode_disconnect`](./mqtt_codec_disconnect.md)
* [`auth [0xf]: mqtt_decode_auth / mqtt_encode_auth`](./mqtt_codec_auth.md)



### Advanced API

* `function mqtt_pkt_ctx(mqtt_level, {decode_fns, mqtt_reader, encode_fns, mqtt_writer}, pkt_ctx)`

  Returns a bound `mqtt_ctx` with bound `decode_pkt`, `encode_pkt`, `mqtt_stream`, and subclass of `pkt_ctx` suitable for use in MQTT clients.
  For an MQTT stream connection, use `mqtt_stream()` to invoke `mqtt_raw_dispatch` with the extended `pkt_ctx`.

  ```javascript
  // @flow

  type mqtt_ctx = {
    pkt_ctx : pkt_ctx_type,
    decode_pkt(b0, u8_body) : pkt,
    encode_pkt(type, pkt) : Uint8Array,
    mqtt_stream() : mqtt_ctx,
    decode(u8) => Array<pkt>, // set upon invoking mqtt_stream()
  }

  type pkt_ctx_type = {
    mqtt_level: u8,
    hdr : u8, // lower 4 bits of b0 masked
    id : u8,  // high 4 bits of b0 shfited
    type : string, // id mapped to string for the packet type
    b0 : u8, // raw first byte of mqtt packet
  }
  ```

  For example, provide JSON utilities for payloads:

  ```javascript
  import { mqtt_pkt_ctx, mqtt_opts_v5 } from 'u8-mqtt-packet/esm/codec_v5_client.js'

  const custom_pkt_api = {
    utf8(u8) { return new TextDecoder('utf-8').decode(u8 || this.payload ) },
    json(u8) { return JSON.parse( this.utf8(u8) || null ) },
    text(u8) { return this.utf8(u8) },
  }

  mqtt_pkt_ctx(5, mqtt_opts_v5, custom_pkt_api)
  ```



### Internal API

* `function mqtt_raw_dispatch(opt) : closure`

  manages packets split across incrementally recieved partial buffers. The returned closure `function(u8_buf) : [mqtt_packets]` accepts a `Uint8Array` buffer that encodes 0 or more MQTT packets and returns a list of decoded MQTT packets as processed by `decode_raw_pkt(b0, u8_body) : pkt | null`.
  Invokes `opt.decode_pkt(b0, u8_body, opt)` for each decoded MQTT packet.

* `encode_varint(n, a=[])`

  encodes a `uint32` according to MQTT variable integer coding rules. Individual bytes are appended to via `a.push(b)`, avoiding a temporary array.

* `decode_varint(u8, i=0) : [n, i]`

  decodes a `uint32` according to MQTT variable integer coding rules from `u8 : Uint8Array` at offset `i`. Returns a tuple of the decoded number and new offset.

* `mqtt_props`

  map MQTT properties by name and id to a property descriptor: `{id: u8, type: string, name: string, plural?: boolean}`

