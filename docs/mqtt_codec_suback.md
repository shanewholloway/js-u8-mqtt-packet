##### MQTT `suback [0x9]` packet

##### Version 4

- [3.9 SUBACK – Subscribe acknowledgement](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718068)

| u8   | reason |
|-----:|:-------|
| 0x00 | Granted QoS 0
| 0x01 | Granted QoS 1
| 0x02 | Granted QoS 2

##### Version 5

- [3.9 SUBACK – Subscribe acknowledgement](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901171)

Includes MQTT [props](./mqtt_props.md)

| u8   | reason |
|-----:|:-------|
| 0x00 | Granted QoS 0
| 0x01 | Granted QoS 1
| 0x02 | Granted QoS 2
| 0x80 | Unspecified error
| 0x83 | Implementation specific error
| 0x87 | Not authorized
| 0x8F | Topic Filter invalid
| 0x91 | Packet Identifier in use
| 0x97 | Quota exceeded
| 0x9E | Shared Subscriptions not supported
| 0xA1 | Subscription Identifiers not supported
| 0xA2 | Wildcard Subscriptions not supported

#### Codec

```javascript
// @flow

type pkt_suback_v4 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  answers : Array<u8>,
}

type pkt_suback_v5 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  props : mqtt_props_v5,
  answers : Array<u8>,
}
```

