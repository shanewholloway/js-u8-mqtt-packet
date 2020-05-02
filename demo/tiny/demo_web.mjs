import {on_mqtt, demo_in_your_code} from '../_demo_common.mjs'
import {mqtt_tiny_session} from './tiny_session.mjs'
import {MQTTBonesWebClient} from 'u8-mqtt-packet/esm/client/core_web.mjs'

class MQTTClient extends MQTTBonesWebClient {}
MQTTClient.with(mqtt_tiny_session)


const my_mqtt = new MQTTClient(on_mqtt)
my_mqtt
  //.with_websock('ws://127.0.0.1:9001')
  .with_websock('wss://test.mosquitto.org:8081')
  .then(demo_in_your_code)

window.my_mqtt = my_mqtt
