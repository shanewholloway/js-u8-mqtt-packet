
export function mqtt_encode_connack(ns, mqtt_writer) {
  const _enc_flags_connack = flags =>
    flags.session_present ? 1 : 0

  return ns.connack = (mqtt_level, pkt) => {
    let wrt = new mqtt_writer()

    let {flags} = pkt
    wrt.u8_flags( pkt.flags, _enc_flags_connack )

    if (5 <= mqtt_level) {
      wrt.u8_reason( pkt.reason )
      wrt.props( pkt.props )

    } else {
      wrt.u8_reason( pkt.return_code || pkt.reason )
    }

    return wrt.as_pkt(0x20)
  }
}

