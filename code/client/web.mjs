import {mqtt_session_v4, mqtt_session_v5} from '../session.mjs'
import {MQTTBonesWebClient as Bones} from './core_web.mjs'

export class MQTTBonesWeb_v4 extends Bones {
  mqtt_session() { return mqtt_session_v4() }
}

export class MQTTBonesWeb_v5 extends Bones {
  mqtt_session() { return mqtt_session_v5() }
}

export default MQTTBonesWeb_v4
