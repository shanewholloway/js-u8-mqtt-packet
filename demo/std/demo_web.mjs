//import MQTTClient from 'u8-mqtt-packet/esm/client/web.mjs'
import MQTTClient from '../../esm/client/web.min.mjs'
import {on_mqtt, demo_in_your_code} from '../_demo_common.mjs'

const my_mqtt = new MQTTClient(on_mqtt)
my_mqtt
  //.with_websock('ws://127.0.0.1:9001')
  .with_websock('wss://test.mosquitto.org:8081')
  .then(demo_in_your_code)

window.my_mqtt = my_mqtt
