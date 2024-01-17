
export function mqtt_encode_connack(ns, mqtt_writer) {
  const _enc_flags_connack = flags =>
    flags.session_present ? 1 : 0

  return ns.connack = (mqtt_level, pkt) => {
    let wrt = mqtt_writer.for(pkt)

    wrt.flags( pkt.flags, _enc_flags_connack )

    if (5 <= mqtt_level) {
      wrt.reason( pkt.reason )
      wrt.props( pkt.props )

    } else {
      wrt.reason( pkt.return_code || pkt.reason )
    }

    return wrt.as_pkt(0x20)
  }
}


export function mqtt_decode_connack(ns, mqtt_reader) {
  class _connack_flags_ extends Number {
    get session_present() { return this & 0x01 !== 0 }
  }

  return ns[0x2] = (pkt, u8_body) => {
    let rdr = mqtt_reader.for(pkt, u8_body)

    let flags = pkt.flags =
      rdr.flags(_connack_flags_)

    pkt.reason = rdr.reason(pkt.type)
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()
    return pkt }
}

