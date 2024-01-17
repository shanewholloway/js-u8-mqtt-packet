
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


export function _unsuback_v4(mqtt_reader) {
  mqtt_reader.reasons('unsuback',
    // MQTT 3.1.1
    [ 0x00, 'Success'],
    [ 0x11, 'No subscription existed'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
  )
}

export { _unsuback_v4 as _unsuback_v5 }

export function _suback_v4(mqtt_reader) {
  mqtt_reader.reasons('suback',
    // MQTT 3.1.1
    [ 0x00, 'Granted QoS 0'],
    [ 0x01, 'Granted QoS 1'],
    [ 0x02, 'Granted QoS 2'],
  )
}

export function _suback_v5(mqtt_reader) {
  _suback_v4(mqtt_reader)

  mqtt_reader.reasons('suback',
    // MQTT 5.0
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
    [ 0x97, 'Quota exceeded'],
    [ 0x9E, 'Shared Subscriptions not supported'],
    [ 0xA1, 'Subscription Identifiers not supported'],
    [ 0xA2, 'Wildcard Subscriptions not supported'],
  )
}

