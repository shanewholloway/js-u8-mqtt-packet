import mqtt_session_ctx from '../session.mjs'
import {MQTTBonesWebClient as Bones} from './core_web.mjs'

export class MQTTBonesWeb_v4 extends Bones {}
export class MQTTBonesWeb_v5 extends Bones {}

MQTTBonesWeb_v4.with(mqtt_session_ctx(4))
MQTTBonesWeb_v5.with(mqtt_session_ctx(5))

export default MQTTBonesWeb_v4
