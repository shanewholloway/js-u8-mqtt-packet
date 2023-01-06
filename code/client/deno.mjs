import { mqtt_ctx_v4, mqtt_ctx_v5 } from '../codec_v5_client.mjs'
import { MQTTBonesDenoClient as Bones } from './core_deno.mjs'

export class MQTTBonesDeno_v4 extends Bones {
  _mqtt_session() { return mqtt_ctx_v4() }
}

export class MQTTBonesDeno_v5 extends Bones {
  _mqtt_session() { return mqtt_ctx_v5() }
}

export default MQTTBonesDeno_v4
