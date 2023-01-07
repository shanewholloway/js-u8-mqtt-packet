##### MQTT `unsuback [0xb]` packet

##### Version 4

- [3.11 UNSUBACK – Unsubscribe acknowledgement](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718077)

| u8   | reason |
|-----:|:-------|
| 0x00 | Success
| 0x11 | No subscription existed
| 0x80 | Unspecified error
| 0x83 | Implementation specific error
| 0x87 | Not authorized
| 0x8F | Topic Filter invalid
| 0x91 | Packet Identifier in use

##### Version 5

- [3.11 UNSUBACK – Unsubscribe acknowledgement](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901187)

Includes MQTT [props](./mqtt_props.md)

| u8   | reason |
|-----:|:-------|
| 0x00 | Success
| 0x11 | No subscription existed
| 0x80 | Unspecified error
| 0x83 | Implementation specific error
| 0x87 | Not authorized
| 0x8F | Topic Filter invalid
| 0x91 | Packet Identifier in use


#### Codec

```javascript
// @flow

type pkt_unsuback_v4 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  answers : Array<u8>,
}

type pkt_unsuback_v5 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  props : mqtt_props_v5,
  answers : Array<u8>,
}
```

