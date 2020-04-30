import {mqtt_tiny_session} from './tiny_session.mjs'
import MQTTWebClient from 'u8-mqtt-packet/esm/client/core_web.mjs'
export default class extends MQTTWebClient {
  get mqtt_session() { return mqtt_tiny_session }
}

