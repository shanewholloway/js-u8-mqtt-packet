
export function mqtt_encode_pubxxx(ns, mqtt_writer) {
  ns.pubrec = _enc_pubxxx(0x50)
  ns.pubrel = _enc_pubxxx(0x62)
  ns.pubcomp = _enc_pubxxx(0x70)


  function _enc_pubxxx(hdr) {
    return ( mqtt_level, pkt ) => {
      let wrt = mqtt_writer.of(pkt)

      wrt.u16(pkt.pkt_id)
      if (5 <= mqtt_level) {
        wrt.props(pkt.props)
        wrt.reason(pkt.reason)

      } else {
        wrt.reason( pkt.return_code || pkt.reason )
      }

      return wrt.as_pkt(hdr)
    }
  }
}

export function mqtt_decode_pubxxx(ns, mqtt_reader) {
  return ns[0x5] = ns[0x6] = ns[0x7] = (pkt, u8_body) => {
    let rdr = mqtt_reader.of(u8_body)

    pkt.pkt_id = rdr.u16()
    pkt.reason = rdr.reason('pubxxx', mqtt_reader)
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()
    return pkt }
}

