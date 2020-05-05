import { _mqtt_raw_pkt_dispatch } from './framing.mjs'
export { _mqtt_raw_pkt_dispatch } from './framing.mjs'


export {mqtt_decode_connect} from './decode/connect.mjs'
export {mqtt_decode_connack} from './decode/connack.mjs'
export {mqtt_decode_publish} from './decode/publish.mjs'
export {mqtt_decode_puback} from './decode/puback.mjs'
export {mqtt_decode_pubxxx} from './decode/pubrec_pubrel_pubcomp.mjs'
export {mqtt_decode_subscribe} from './decode/subscribe.mjs'
export {mqtt_decode_suback} from './decode/suback.mjs'
export {mqtt_decode_unsubscribe} from './decode/unsubscribe.mjs'
export {mqtt_decode_unsuback} from './decode/unsuback.mjs'
export {mqtt_decode_pingxxx} from './decode/pingreq_pingresp.mjs'
export {mqtt_decode_disconnect} from './decode/disconnect.mjs'
export {mqtt_decode_auth} from './decode/auth.mjs'
export const mqtt_decode_zero = ns => (ns[0] = pkt => pkt)


export {mqtt_encode_connect} from './encode/connect.mjs'
export {mqtt_encode_connack} from './encode/connack.mjs'
export {mqtt_encode_publish} from './encode/publish.mjs'
export {mqtt_encode_puback} from './encode/puback.mjs'
export {mqtt_encode_pubxxx} from './encode/pubrec_pubrel_pubcomp.mjs'
export {mqtt_encode_subscribe} from './encode/subscribe.mjs'
export {mqtt_encode_xxsuback} from './encode/suback_unsuback.mjs'
export {mqtt_encode_unsubscribe} from './encode/unsubscribe.mjs'
export {mqtt_encode_pingxxx} from './encode/pingreq_pingresp.mjs'
export {mqtt_encode_disconnect} from './encode/disconnect.mjs'
export {mqtt_encode_auth} from './encode/auth.mjs'


export function _bind_mqtt_decode(lst_decode_ops) {
  const by_id = []
  for (const op of lst_decode_ops) op(by_id)

  return _mqtt_raw_pkt_dispatch( pkt => {
    const decode_pkt = by_id[pkt.type_obj.id] || by_id[0]
    if (undefined !== decode_pkt)
      return decode_pkt(pkt)
  })
}


export function _bind_mqtt_encode(lst_encode_ops) {
  const by_type = {}
  for (const op of lst_encode_ops) op(by_type)

  return mqtt_level => {
    mqtt_level = +mqtt_level || mqtt_level.mqtt_level
    return (type, pkt) =>
      by_type[type]( mqtt_level, pkt )
  }
}


export function _bind_mqtt_session_ctx(sess_decode, sess_encode, _pkt_ctx_) {
  sess_decode = _bind_mqtt_decode(sess_decode)
  sess_encode = _bind_mqtt_encode(sess_encode)

  const _sess_ctx = mqtt_level =>
    () => {
      let x = {__proto__: _pkt_ctx_, mqtt_level}
      x._base_ = x
      return [sess_decode(x), sess_encode(x)]
    }

  _sess_ctx.v4 = _sess_ctx(4)
  _sess_ctx.v5 = _sess_ctx(5)
  return _sess_ctx
}

