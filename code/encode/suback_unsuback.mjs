
export function mqtt_encode_xxsuback(ns, mqtt_writer) {
  ns.suback = _enc_xxsuback(0x90)
  ns.unsuback = _enc_xxsuback(0xb0)


  function _enc_xxsuback(hdr) {
    return ( mqtt_level, pkt ) => {
      let wrt = new mqtt_writer()

      wrt.u16(pkt.pkt_id)
      if (5 <= mqtt_level)
        wrt.props(pkt.props)

      for (let ans of pkt.answers)
        wrt.u8_reason(ans)

      return wrt.as_pkt(hdr)
    }
  }
}
