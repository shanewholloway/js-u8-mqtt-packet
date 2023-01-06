import { mqtt_ctx_v4, mqtt_ctx_v5 } from '../codec_v5_client.mjs'
import { MQTTBonesWebClient as Bones } from './core_web.mjs'

export class MQTTBonesWeb_v4 extends Bones {
  _mqtt_session() { return mqtt_ctx_v4() }
}

export class MQTTBonesWeb_v5 extends Bones {
  _mqtt_session() { return mqtt_ctx_v5() }
}

export default MQTTBonesWeb_v4
