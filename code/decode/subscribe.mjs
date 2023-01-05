
export function mqtt_decode_subscribe(ns, mqtt_reader) {
  class _subscription_options_ extends Number {
    get qos() { return this & 0x3 }
    get retain() { return this & 0x4 !== 0 }
    get retain_handling() { return (this >> 2) & 0x3 }
  }

  return ns[0x8] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0)

    pkt.pkt_id = rdr.u16()
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()

    let topic_list = pkt.topics = []
    while (rdr.has_more()) {
      let topic = rdr.utf8()
      let opts = rdr.u8_flags(_subscription_options_)
      topic_list.push({topic, opts})
    }

    return pkt }
}
