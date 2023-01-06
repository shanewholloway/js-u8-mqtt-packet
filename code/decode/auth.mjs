
export function mqtt_decode_auth(ns, mqtt_reader) {
  return ns[0xf] = (pkt, u8_body) => {
    if ( 5 <= pkt.mqtt_level ) {
      let rdr = mqtt_reader.of(u8_body)
      pkt.reason = rdr.reason(pkt.type)
      pkt.props = rdr.props()
    }
    return pkt }
}


export function _auth_v5(mqtt_reader) {
  mqtt_reader.reasons('auth',
    // MQTT 5.0
    [ 0x00, 'Success' ],
    [ 0x18, 'Continue authentication' ],
    [ 0x19, 'Re-authenticate' ],
  )
}
