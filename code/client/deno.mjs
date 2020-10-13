import {mqtt_session_ctx} from '../session.mjs'
import {MQTTBonesDenoClient as Bones} from './core_deno.mjs'

export class MQTTBonesDeno_v4 extends Bones {
  _mqtt_session() { return mqtt_session_ctx(4)() }
}

export class MQTTBonesDeno_v5 extends Bones {
  _mqtt_session() { return mqtt_session_ctx(5)() }
}

export default MQTTBonesDeno_v4
