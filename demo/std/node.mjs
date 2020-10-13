//import MQTTClient from 'u8-mqtt-packet/esm/client/node.mjs'
import {MQTTBonesNode_v4, MQTTBonesNode_v5} from 'u8-mqtt-packet/esm/client/node.mjs'
import {on_mqtt, demo_in_your_code as on_live} from '../_demo_common.mjs'

const {host, port} = 1
  ? {port: 1883, host: '127.0.0.1'}
  : {port: 1883, host: 'test.mosquitto.org'}

const mqtt_versions = { v311: MQTTBonesNode_v4, v4: MQTTBonesNode_v4, v5: MQTTBonesNode_v5}
const _mqtt_key = (process.env.U8_MQTT_VER || 'v4').toLowerCase()
const MQTTClient = mqtt_versions[_mqtt_key]
console.log('MQTT:', _mqtt_key, MQTTClient)


globalThis.my_mqtt =
  new MQTTClient({on_mqtt, on_live})
    .with_tcp(port, host)
