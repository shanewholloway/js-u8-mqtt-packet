
export function mqtt_encode_pubxxx(ns, mqtt_writer) {
  ns.pubrec = _enc_pubxxx(0x50)
  ns.pubrel = _enc_pubxxx(0x62)
  ns.pubcomp = _enc_pubxxx(0x70)


  function _enc_pubxxx(hdr) {
    return ( mqtt_level, pkt ) => {
      let wrt = new mqtt_writer()

      wrt.u16(pkt.pkt_id)
      if (5 <= mqtt_level) {
        wrt.props(pkt.props)
        wrt.u8_reason(pkt.reason)

      } else {
        wrt.u8_reason( pkt.return_code || pkt.reason )
      }

      return wrt.as_pkt(hdr)
    }
  }
}
