import MQTTClient from 'u8-mqtt-packet/esm/client/node.mjs'
import {on_mqtt, demo_in_your_code} from '../_demo_common.mjs'


const my_mqtt = globalThis.my_mqtt =
  new MQTTClient(on_mqtt)
    .with_tcp(1883, '127.0.0.1')
    //.with_tcp(1883, 'test.mosquitto.org')


my_mqtt.on_live = demo_in_your_code
