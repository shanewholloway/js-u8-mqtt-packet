
export function mqtt_encode_xxsuback(ns, mqtt_writer) {
  ns.suback = _enc_xxsuback(0x90)
  ns.unsuback = _enc_xxsuback(0xb0)


  function _enc_xxsuback(hdr) {
    return ( mqtt_level, pkt ) => {
      let wrt = mqtt_writer.of(pkt)

      wrt.u16(pkt.pkt_id)
      if (5 <= mqtt_level)
        wrt.props(pkt.props)

      for (let ans of pkt.answers)
        wrt.reason(ans)

      return wrt.as_pkt(hdr)
    }
  }
}


export function mqtt_decode_xxsuback(ns, mqtt_reader) {
  return ns[0x9] = ns[0xb] = (pkt, u8_body) => {
    let rdr = mqtt_reader.of(u8_body)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    let answers = pkt.answers = []
    while (rdr.has_more())
      answers.push(
        rdr.reason(pkt.type) )

    return pkt }
}

