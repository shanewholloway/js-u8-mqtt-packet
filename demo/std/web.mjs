//import MQTTClient from 'u8-mqtt-packet/esm/client/web.min.mjs'
import {MQTTBonesWeb_v4, MQTTBonesWeb_v5} from '../../esm/client/web.mjs'
import {on_mqtt, demo_in_your_code as on_live} from '../_demo_common.mjs'

const url_mqtt = 1
  ? 'ws://127.0.0.1:9001'
  : 'wss://test.mosquitto.org:8081'

const mqtt_versions = { v311: MQTTBonesWeb_v4, v4: MQTTBonesWeb_v4, v5: MQTTBonesWeb_v5}
const _mqtt_key = (location.hash || '#v4').replace('#','')
const MQTTClient = mqtt_versions[_mqtt_key]
console.log('MQTT:', _mqtt_key, MQTTClient)


window.my_mqtt =
  new MQTTClient({on_mqtt, on_live})
    .with_websock(url_mqtt)
