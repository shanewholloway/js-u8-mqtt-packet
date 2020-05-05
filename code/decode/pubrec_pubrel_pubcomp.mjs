import {mqtt_type_reader, bind_reason_lookup} from './_utils.mjs'


export function mqtt_decode_pubxxx(ns) {
  const _pubxxx_reason_ = bind_reason_lookup([
    [ 0x00, 'Success' ],
    [ 0x92, 'Packet Identifier not found' ],
  ])

  return ns[0x5] = ns[0x6] = ns[0x7] = pkt => {
    const rdr = new mqtt_type_reader(pkt.u8_body, 0)

    pkt.pkt_id = rdr.u16()
    pkt.reason = rdr.u8_reason(_pubxxx_reason_)
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()
    return pkt }
}

