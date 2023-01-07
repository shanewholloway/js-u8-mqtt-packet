##### MQTT `disconnect [0xe]` packet

##### Version 4

- [3.14 DISCONNECT – Disconnect notification](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718090)


##### Version 5

- [3.14 DISCONNECT – Disconnect notification](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901205)

Includes MQTT [props](./mqtt_props.md)

| u8   | reason |
|-----:|:-------|
| 0x00 | Normal disconnection
| 0x04 | Disconnect with Will Message
| 0x80 | Unspecified error
| 0x81 | Malformed Packet
| 0x82 | Protocol Error
| 0x83 | Implementation specific error
| 0x87 | Not authorized
| 0x89 | Server busy
| 0x8B | Server shutting down
| 0x8D | Keep Alive timeout
| 0x8E | Session taken over
| 0x8F | Topic Filter invalid
| 0x90 | Topic Name invalid
| 0x93 | Receive Maximum exceeded
| 0x94 | Topic Alias invalid
| 0x95 | Packet too large
| 0x96 | Message rate too high
| 0x97 | Quota exceeded
| 0x98 | Administrative action
| 0x99 | Payload format invalid
| 0x9A | Retain not supported
| 0x9B | QoS not supported
| 0x9C | Use another server
| 0x9D | Server moved
| 0x9E | Shared Subscriptions not supported
| 0x9F | Connection rate exceeded
| 0xA0 | Maximum connect time
| 0xA1 | Subscription Identifiers not supported
| 0xA2 | Wildcard Subscriptions not supported

#### Codec

```javascript
// @flow

type pkt_disconnect_v4 = {
  __proto__: _pkt_ctx_,
}

type pkt_disconnect_v5 = {
  __proto__: _pkt_ctx_,
  reason : u8,
  props : mqtt_props_v5,
}
```

