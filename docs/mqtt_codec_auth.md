##### MQTT `auth [0xf]` packet

###### Version 4

Not applicable.


###### Version 5

[3.15 AUTH – Authentication exchange](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901217)


#### Codec

```javascript
// @flow

type pkt_auth_v5 = {
  __proto__: _pkt_ctx_,
  reason : u8,
  props : mqtt_props_v5,
}
```
