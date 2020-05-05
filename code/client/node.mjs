import {mqtt_session_ctx} from '../session.mjs'
import {MQTTBonesNodeClient as Bones} from './core_node.mjs'

export class MQTTBonesNode_v4 extends Bones {}
export class MQTTBonesNode_v5 extends Bones {}

const {v4, v5} = mqtt_session_ctx()
MQTTBonesNode_v4.with(v4)
MQTTBonesNode_v5.with(v5)

export default MQTTBonesNode_v4
