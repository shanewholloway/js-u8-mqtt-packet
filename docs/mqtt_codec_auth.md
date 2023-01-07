##### MQTT `auth [0xf]` packet

Also see [connect packet](./mqtt_codec_connect.md) for default `{username, password}` authentication methods.

###### Version 4

Not available. Use [connect packet](./mqtt_codec_connect.md) for default `{username, password}` authentication.


###### Version 5

[3.15 AUTH – Authentication exchange](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901217)

Includes MQTT [props](./mqtt_props.md)

| u8   | reason |
|-----:|:-------|
| 0x00 | Success
| 0x18 | Continue authentication
| 0x19 | Re-authenticate

#### Codec

```javascript
// @flow

type pkt_auth_v5 = {
  __proto__: _pkt_ctx_,
  reason : u8,
  props : mqtt_props_v5,
}
```
