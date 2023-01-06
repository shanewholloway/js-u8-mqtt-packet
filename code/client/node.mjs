import { mqtt_ctx_v4, mqtt_ctx_v5 } from '../codec_v5_client.mjs'
import { MQTTBonesNodeClient as Bones } from './core_node.mjs'

export class MQTTBonesNode_v4 extends Bones {
  _mqtt_session() { return mqtt_ctx_v4() }
}

export class MQTTBonesNode_v5 extends Bones {
  _mqtt_session() { return mqtt_ctx_v5() }
}

export default MQTTBonesNode_v4
