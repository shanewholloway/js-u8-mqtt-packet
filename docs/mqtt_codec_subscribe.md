##### MQTT `subscribe [0x8]` packet

##### Version 4

- [3.8 SUBSCRIBE - Subscribe to topics](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718063)


##### Version 5

- [3.8 SUBSCRIBE - Subscribe request](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901161)


#### Codec

```javascript
// @flow

type pkt_subscribe_v4 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  topic_list : Array<topics>,
}

type pkt_subscribe_v5 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  props : mqtt_props_v5,
  topic_list : Array<topics>,
}

type subscribe_topic = {
  topic : string,
  opt : subscript_options,
}

type subscript_options = {
  qos : u2,
  retain : boolean,
  retain_handling : u2,
}
```
