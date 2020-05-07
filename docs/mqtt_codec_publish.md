##### MQTT `publish [0x3]` packet

##### Version 4

- [3.3 PUBLISH – Publish message](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718037)


##### Version 5

- [3.3 PUBLISH – Publish message](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901100)


#### Codec

```javascript
// @flow

type pkt_XYZ_v4 = {
  __proto__: _pkt_ctx_,
  dup : boolean,
  retain : boolean,
  qos : u2,
  topic : string,
  pkt_id : ?u16,
  payload : Uint8Array,
}

type pkt_XYZ_v5 = {
  __proto__: _pkt_ctx_,
  dup : boolean,
  retain : boolean,
  qos : u2,
  topic : string,
  pkt_id : ?u16,
  props : mqtt_props_v5,
  payload : Uint8Array,
}
```
