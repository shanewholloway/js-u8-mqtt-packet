##### MQTT `suback [0x9]`, and `unsuback [0xb]` packets

##### Version 4

- [3.9 SUBACK – Subscribe acknowledgement](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718068)
- [3.11 UNSUBACK – Unsubscribe acknowledgement](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718077)


##### Version 5

- [3.9 SUBACK – Subscribe acknowledgement](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901171)
- [3.11 UNSUBACK – Unsubscribe acknowledgement](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901187)


#### Codec

```javascript
// @flow

// pkt_suback_v4, pkt_unsuback_v4
type pkt_xxsuback_v4 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  answers : Array<u8>,
}

// pkt_suback_v5, pkt_unsuback_v5
type pkt_xxsuback_v5 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  props : mqtt_props_v5,
  answers : Array<u8>,
}
```

