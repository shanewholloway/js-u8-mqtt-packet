import {mqtt_session_v4, mqtt_session_v5} from '../session.mjs'
import {MQTTBonesNodeClient as Bones} from './core_node.mjs'

export class MQTTBonesNode_v4 extends Bones {
  mqtt_session() { return mqtt_session_v4() }
}

export class MQTTBonesNode_v5 extends Bones {
  mqtt_session() { return mqtt_session_v5() }
}

export default MQTTBonesNode_v4
