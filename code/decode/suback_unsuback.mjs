
export function _mqtt_decode_suback(mqtt_reader) {
  return (pkt, u8_body) => {
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

