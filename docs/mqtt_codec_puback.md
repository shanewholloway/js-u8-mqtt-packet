##### MQTT `puback [0x4]` packet

##### Version 4

- [3.4 PUBACK – Publish acknowledgement](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718043)


##### Version 5

- [3.4 PUBACK – Publish acknowledgement](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901121)

Includes MQTT [props](./mqtt_props.md)

| u8   | reason |
|-----:|:-------|
| 0x00 | Success
| 0x10 | No matching subscribers
| 0x80 | Unspecified error
| 0x83 | Implementation specific error
| 0x87 | Not authorized
| 0x90 | Topic Name invalid
| 0x91 | Packet identifier in use
| 0x97 | Quota exceeded
| 0x99 | Payload format invalid

#### Codec

```javascript
// @flow

type pkt_puback_v4 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
}

type pkt_puback_v5 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  reason : u8,
  props : mqtt_props_v5,
}
```

