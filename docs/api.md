### Simple API

* `function mqtt_session_4()` and `function mqtt_session_5()`

  returns `[mqtt_decode(pkt, u8_body), mqtt_encode(type, pkt)]` bound for `mqtt_level` suitable for use in MQTT clients.


  ```javascript
  const mqtt_session_v4 = mqtt_session_ctx(4)
  const [mqtt_decode, mqtt_encode] = mqtt_session_v4()

  const mqtt_session_v5 = mqtt_session_ctx(5)
  const [mqtt_decode, mqtt_encode] = mqtt_session_v5()
  ```

  See `mqtt_session_ctx`.


### MQTT Packets

#### Decoders

MQTT decoders are of the form `(pkt, u8_body) => pkt` where `pkt` is a prototype object created by `{__proto__: _pkt_ctx_, b0}`, the `u8_body` is a `Uint8Array` that encodes the MQTT packet body. See `_bind_mqtt_decode` and `_bind_pkt_ctx` for `_pkt_ctx_` details.

Each decoder will round-trip a `Uint8Array` raw packet buffer created by the corresponding `mqtt_encode_xxx(mqtt_level, pkt)` encoder.

To facilitate simple and correct use, each `mqtt_decode_xxx(ns)` function accepts a namespace array where the decoder is assigned by MQTT command id (`b0 >>> 4`). See `_bind_mqtt_decode` for details.


#### Encoders

MQTT encoders are of the form `(mqtt_level, pkt) => u8_pkt` where `pkt` is an object and the returned `u8_pkt` is a `Uint8Array` that encodes the MQTT packet.

Each encoder will round-trip a `pkt` object created by the corresponding `mqtt_decode_xxx({b0}, u8_body)` decoder.

To facilitate simple and correct use, the `mqtt_encode_xxx(ns)` function accepts a namespace object where the encoder is installed by MQTT command name. See `_bind_mqtt_encode` for details.


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
* [`suback [0x9]: mqtt_decode_suback / mqtt_encode_xxsuback`](./mqtt_codec_suback_unsuback.md)
* [`unsubscribe [0xa]: mqtt_decode_unsubscribe / mqtt_encode_unsubscribe`](./mqtt_codec_unsubscribe.md)
* [`unsuback [0xb]: mqtt_decode_unsuback / mqtt_encode_xxsuback`](./mqtt_codec_suback_unsuback.md)
* [`pingreq [0xc]: mqtt_decode_pingxxx / mqtt_encode_pingxxx`](./mqtt_codec_pingreq_pingresp.md)
* [`pingresp [0xd]: mqtt_decode_pingxxx / mqtt_encode_pingxxx`](./mqtt_codec_pingreq_pingresp.md)
* [`disconnect [0xe]: mqtt_decode_disconnect / mqtt_encode_disconnect`](./mqtt_codec_disconnect.md)
* [`auth [0xf]: mqtt_decode_auth / mqtt_encode_auth`](./mqtt_codec_auth.md)



### Advanced API

* `function mqtt_session_ctx(mqtt_level)`

  returns a lazily bound session context able to decode and encode all MQTT packets. As the complete codec is included, the composite JavaScript source size is ~50% larger than required for most MQTT clients. (13kb vs 8.5kb)

  See `_bind_mqtt_session_ctx` and [`demo/tiny/tiny_session.mjs`](../demo/tiny/tiny_session.mjs) for customization.


* `function _bind_mqtt_session_ctx(sess_decode, sess_encode, _pkt_ctx_)`

    combines `_bind_mqtt_decode(sess_decode)` with `_bind_mqtt_encode(sess_encode)` and `_bind_pkt_ctx(_pkt_ctx_)` to
    return a closure `mqtt_level => function mqtt_session()`. Calling `mqtt_session()` returns a new bound `function mqtt_decode(pkt, u8_body)` and `function mqtt_encode(type, pkt)` suitable for use in MQTT clients.

  See `_bind_mqtt_decode`, `_bind_mqtt_encode`, and `_bind_pkt_ctx`. `mqtt_session_ctx` uses this function.


* `function _bind_mqtt_decode(lst_decode_ops)`

  returns an `mqtt_session_decode` closure `_pkt_ctx_ => (b0, u8_body) => pkt` that transforms raw packet bytes into packet objects by dispatching to operations from `lst_decode_ops`.

  See `mqtt_decode_*` operations.


* `function _bind_mqtt_encode(lst_encode_ops)`

  returns an `mqtt_session_encode` closure `({mqtt_level}) => (type, pkt) => u8_pkt` that transforms packet objects into raw Uint8Array packet buffers by dispatching to operations from `lst_encode_ops`.

  See `mqtt_encode_*` operations.


* `function _bind_pkt_ctx(_pkt_ctx_={})`

  defines `hdr`, `id`, and `type` getters on `_pkt_ctx_` based on `pkt.b0` value.



### Internal API

* `function _mqtt_raw_pkt_decode_v(by_ref) : boolish`

  where `by_ref` is a two-way reference array. Pass in `[u8_buffer]` to be processed. Returns `true` when all packets have been extracted from current buffer. Returns `undefined` and passes out `[u8_buffer, raw_pkt_byte0, raw_pkt_body]` via `by_ref` where `u8_buffer` has the remaining buffer, `raw_pkt_byte0` is the MQTT packet header byte, and `raw_pkt_body` is a `Uint8Array | null`.

* `function _mqtt_raw_pkt_dispatch(decode_raw_pkt) : closure`

  manages packets split across incrementally recieved partial buffers. The returned closure `function(u8_buf) : [mqtt_packets]` accepts a `Uint8Array` buffer that encodes 0 or more MQTT packets and returns a list of decoded MQTT packets as processed by `decode_raw_pkt(b0, u8_body) : pkt | null`.

* `encode_varint(n, a=[])`

  encodes a `uint32` according to MQTT variable integer coding rules. Individual bytes are appended to via `a.push(b)`, avoiding a temporary array.

* `decode_varint(u8, i=0) : [n, i]`

  decodes a `uint32` according to MQTT variable integer coding rules from `u8 : Uint8Array` at offset `i`. Returns a tuple of the decoded number and new offset.

* `mqtt_props`

  map MQTT properties by name and id to a property descriptor: `{id: u8, type: string, name: string, plural?: boolean}`

