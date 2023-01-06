
export function mqtt_encode_connack(ns, mqtt_writer) {
  const _enc_flags_connack = flags =>
    flags.session_present ? 1 : 0

  return ns.connack = (mqtt_level, pkt) => {
    let wrt = mqtt_writer.of(pkt)

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

