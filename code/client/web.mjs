import {mqtt_session_ctx} from '../session.mjs'
import {MQTTBonesWebClient as Bones} from './core_web.mjs'

export class MQTTBonesWeb_v4 extends Bones {}
export class MQTTBonesWeb_v5 extends Bones {}

const {v4, v5} = mqtt_session_ctx()
MQTTBonesWeb_v4.with(v4)
MQTTBonesWeb_v5.with(v5)

export default MQTTBonesWeb_v4
