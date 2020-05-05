import {mqtt_type_reader} from './_utils.mjs'

export function mqtt_decode_connect(ns) {
  class _connect_flags_ extends Number {
    get reserved() { return this & 0x01 !== 0 }
    get clean_start() { return this & 0x02 !== 0 }
    get will_flag() { return this & 0x04 !== 0 }
    get will_qos() { return (this >>> 3) & 0x3 }
    get will_retain() { return this & 0x20 !== 0 }
    get password() { return this & 0x40 !== 0 }
    get username() { return this & 0x80 !== 0 }
  }


  return ns[0x1] = pkt => {
    const rdr = new mqtt_type_reader(pkt.u8_body, 0)
    if ('MQTT' !== rdr.utf8())
      throw new Error('Invalid mqtt_connect packet')

    pkt._base_.mqtt_level = pkt.mqtt_level = rdr.u8()

    const flags = pkt.flags =
      rdr.u8_flags(_connect_flags_)

    pkt.keep_alive = rdr.u16()

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()



    pkt.client_id = rdr.utf8()
    if (flags.will_flag) {
      const will = pkt.will = {}
      if (5 <= pkt.mqtt_level)
        will.properties = rdr.props()

      will.topic = rdr.utf8()
      will.payload = rdr.bin()
      will.qos = flags.will_qos
      will.retain = flags.will_retain
    }

    if (flags.username)
      pkt.username = rdr.utf8()

    if (flags.password)
      pkt.password = rdr.bin()
    return pkt }
}
