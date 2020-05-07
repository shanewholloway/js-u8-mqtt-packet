import {mqtt_type_reader} from './_utils.mjs'

export function _mqtt_decode_suback(_ack_reason_) {
  return (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    const answers = pkt.answers = []
    while (rdr.has_more())
      answers.push(
        rdr.u8_reason(_ack_reason_) )

    return pkt }
}

