import {on_mqtt, demo_in_your_code} from '../_demo_common.mjs'
import {mqtt_tiny_session} from './tiny_session.mjs'
import {MQTTBonesNodeClient} from 'u8-mqtt-packet/esm/client/core_node.mjs'

class MQTTClient extends MQTTBonesNodeClient {}
MQTTClient.with(mqtt_tiny_session)


const my_mqtt = new MQTTClient(on_mqtt)
my_mqtt
  .with_tcp(1883, '127.0.0.1')
  .then(demo_in_your_code)

