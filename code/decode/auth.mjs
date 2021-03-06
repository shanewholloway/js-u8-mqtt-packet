import {mqtt_type_reader, bind_reason_lookup} from './_utils.mjs'

export function mqtt_decode_auth(ns) {
  const _auth_reason_ = bind_reason_lookup([
    // MQTT 5.0
    [ 0x00, 'Success' ],
    [ 0x18, 'Continue authentication' ],
    [ 0x19, 'Re-authenticate' ],
  ])

  return ns[0xf] = (pkt, u8_body) => {
    if ( 5 <= pkt.mqtt_level ) {
      const rdr = new mqtt_type_reader(u8_body, 0)
      pkt.reason = rdr.u8_reason(_auth_reason_)
      pkt.props = rdr.props()
    }
    return pkt }
}
