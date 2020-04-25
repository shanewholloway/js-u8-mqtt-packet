# u8-mqtt-packet

MQTT packet encoder and decoder using Uint8Array -- suitable for use in the
browser, nodejs, and deno. Zero dependencies. ESM / Tree-shaking friendly.

Targeting [MQTT-3.1.1][spec-3.1.1] and [MQTT-5.0.0][spec-5.0.0] compatibility.

This project was inspired by [mqtt-packet](https://github.com/mqttjs/mqtt-packet)
written for NodeJS. Their codecs are written with a NodeJS ecosystem in mind:
Buffer, EventEmitter, Streams.


 [spec-5.0.0]: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
 [spec-3.1.1]: http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html


## License

[BSD-2-Clause](LICENSE)

