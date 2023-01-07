##### MQTT `connack [0x2]` packet

##### Version 4

- [3.2 CONNACK – Acknowledge connection request](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718033)

| u8   | reason |
|-----:|:-------|
| 0x01 | Connection refused, unacceptable protocol version
| 0x02 | Connection refused, identifier rejected
| 0x03 | Connection refused, server unavailable
| 0x04 | Connection refused, bad user name or password
| 0x05 | Connection refused, not authorized

##### Version 5

- [3.2 CONNACK – Connect acknowledgement](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901074)

Includes MQTT [props](./mqtt_props.md)

| u8   | reason |
|-----:|:-------|
| 0x01 | Connection refused, unacceptable protocol version
| 0x02 | Connection refused, identifier rejected
| 0x03 | Connection refused, server unavailable
| 0x04 | Connection refused, bad user name or password
| 0x05 | Connection refused, not authorized
| 0x81 | Malformed Packet
| 0x82 | Protocol Error
| 0x83 | Implementation specific error
| 0x84 | Unsupported Protocol Version
| 0x85 | Client Identifier not valid
| 0x86 | Bad User Name or Password
| 0x87 | Not authorized
| 0x88 | Server unavailable
| 0x89 | Server busy
| 0x8A | Banned
| 0x8C | Bad authentication method
| 0x90 | Topic Name invalid
| 0x95 | Packet too large
| 0x97 | Quota exceeded
| 0x99 | Payload format invalid
| 0x9A | Retain not supported
| 0x9B | QoS not supported
| 0x9C | Use another server
| 0x9D | Server moved
| 0x9F | Connection rate exceeded


#### Codec

```javascript
// @flow

type pkt_connack_v4 = {
  __proto__: _pkt_ctx_,
  flags : _connack_flags_,
  reason : u8,
}

type pkt_connack_v5 = {
  __proto__: _pkt_ctx_,
  flags : _connack_flags_,
  reason : u8,
  props : mqtt_props_v5,
}

type _connack_flags_ = {
  session_present : boolean,
}
```
