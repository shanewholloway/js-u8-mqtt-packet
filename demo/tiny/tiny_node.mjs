import {mqtt_tiny_session} from './tiny_session.mjs'
import MQTTNodeClient from 'u8-mqtt-packet/esm/client/core_node.mjs'
export default class extends MQTTNodeClient {
  get mqtt_session() { return mqtt_tiny_session }
}

