
export function mqtt_encode_subscribe(ns, mqtt_writer) {
  const _enc_subscribe_flags = opts => 0
      | ( opts.qos & 0x3 )
      | ( opts.retain ? 0x4 : 0 )
      | ( (opts.retain_handling & 0x3) << 2 )

  return ns.subscribe = ( mqtt_level, pkt ) => {
    let wrt = mqtt_writer.for(pkt)

    wrt.u16(pkt.pkt_id)
    if (5 <= mqtt_level)
      wrt.props(pkt.props)

    let f0 = _enc_subscribe_flags(pkt)
    for (let each of pkt.topics) {
      if ('string' === typeof each) {
        wrt.utf8(each)
        wrt.u8(f0)
      } else {
        let [topic, opts] =
          Array.isArray(each) ? each
            : [each.topic, each.opts]

        wrt.utf8(topic)
        if (undefined === opts) wrt.u8(f0)
        else wrt.flags(opts, _enc_subscribe_flags)
      }
    }

    return wrt.as_pkt(0x82)
  }
}

export function mqtt_decode_subscribe(ns, mqtt_reader) {
  class _subscription_options_ extends Number {
    get qos() { return this & 0x3 }
    get retain() { return this & 0x4 !== 0 }
    get retain_handling() { return (this >> 2) & 0x3 }
  }

  return ns[0x8] = (pkt, u8_body) => {
    let rdr = mqtt_reader.for(pkt, u8_body)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    let topic, opts, topic_list = pkt.topics = []
    while (rdr.has_more()) {
      topic = rdr.utf8()
      opts = rdr.flags(_subscription_options_)
      topic_list.push({topic, opts})
    }

    return pkt }
}
