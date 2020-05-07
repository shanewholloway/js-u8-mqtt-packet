##### MQTT `disconnect [0xe]` packet

##### Version 4

- [3.14 DISCONNECT – Disconnect notification](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718090)


##### Version 5

- [3.14 DISCONNECT – Disconnect notification](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901205)


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

