##### MQTT `pingreq [0xc]`, and `pingresp [0xd]` packets

##### Version 4

- [3.12 PINGREQ – PING request](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718081)
- [3.13 PINGRESP – PING response](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718086)


##### Version 5

- [3.12 PINGREQ – PING request](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901195)
- [3.13 PINGRESP – PING response](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901200)


#### Codec

```javascript
// @flow

type pkt_pingreq_v4 = _pkt_ctx_
type pkt_pingreq_v5 = _pkt_ctx_
type pkt_pingresp_v4 = _pkt_ctx_
type pkt_pingresp_v5 = _pkt_ctx_
```

