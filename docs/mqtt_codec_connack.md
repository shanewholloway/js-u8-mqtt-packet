##### MQTT `connack [0x2]` packet

##### Version 4

- [3.2 CONNACK – Acknowledge connection request](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718033)


##### Version 5

- [3.2 CONNACK – Connect acknowledgement](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901074)


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
