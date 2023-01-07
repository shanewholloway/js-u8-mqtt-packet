##### MQTT `unsubscribe [0xa]` packet

##### Version 4

- [3.10 UNSUBSCRIBE – Unsubscribe from topics](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718072)


##### Version 5

- [3.10 UNSUBSCRIBE – Unsubscribe request](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901179)

Includes MQTT [props](./mqtt_props.md)

#### Codec

```javascript
// @flow

type pkt_unsubscribe_v4 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  topic_list : Array<topics>,
}

type pkt_unsubscribe_v5 = {
  __proto__: _pkt_ctx_,
  pkt_id : u16,
  props : mqtt_props_v5,
  topic_list : Array<string>,
}
```

