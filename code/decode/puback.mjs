import {mqtt_type_reader, bind_reason_lookup} from './_utils.mjs'

export function mqtt_decode_puback(ns) {
  const _puback_reason_ = bind_reason_lookup([
    [ 0x00, 'Success'],

    // MQTT 5.0
    [ 0x10, 'No matching subscribers'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x90, 'Topic Name invalid'],
    [ 0x91, 'Packet identifier in use'],
    [ 0x97, 'Quota exceeded'],
    [ 0x99, 'Payload format invalid'],
  ])


  return ns[0x4] = pkt => {
    const rdr = new mqtt_type_reader(pkt.u8_body, 0)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level) {
      pkt.reason = rdr.u8_reason(_puback_reason_)
      pkt.props = rdr.props()
    }

    return pkt }
}

