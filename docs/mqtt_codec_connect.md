##### MQTT `connect [0x1]` packet

##### Version 4

- [3.1 CONNECT – Client requests a connection to a Server](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718028)


##### Version 5

- [3.1 CONNECT – Connection Request](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901033)


#### Codec

The `client_id` attribute is required; all others are optional during encoding.

```javascript
// @flow

type pkt_connect_v4 = {
  __proto__: _pkt_ctx_,
  mqtt_level : u8,
  flags : connect_flags,
  keep_alive : u16,
  client_id : string,
  will : {
    topic : string,
    payload : Uint8Array,
    qos : u2,
    retain : boolean,
  },
  username : string,
  password : string,
}

type pkt_connect_v5 = {
  __proto__: _pkt_ctx_,
  mqtt_level : u8,
  flags : connect_flags,
  keep_alive : u16,
  will : {
    topic : string,
    payload : Uint8Array,
    qos : u2,
    retain : boolean,
    props : mqtt_props_v5,
  },
  username : string,
  password : string,
  props : mqtt_props_v5,
}

type connect_flags = {
  reserved : boolean,
  clean_start : boolean,
  will_flag : boolean,
  will_qos : u2,
  will_retain : boolean,
  password : boolean,
  username : boolean,
}
```
