
export function mqtt_encode_connect(ns, mqtt_writer) {
  const _c_mqtt_proto = new Uint8Array([
    0, 4, 0x4d, 0x51, 0x54, 0x54 ])

  const _enc_flags_connect = flags => 0
      | ( flags.reserved ? 0x01 : 0 )
      | ( (flags.will_qos & 0x3) << 3 )
      | ( flags.clean_start ? 0x02 : 0 )
      | ( flags.will_flag ? 0x04 : 0 )
      | ( flags.will_retain ? 0x20 : 0 )
      | ( flags.password ? 0x40 : 0 )
      | ( flags.username ? 0x80 : 0 )

  const _enc_flags_will = will => 0x4
      | ( (will.qos & 0x3) << 3 )
      | ( will.retain ? 0x20 : 0 )

  return ns.connect = ( mqtt_level, pkt ) => {
    let wrt = mqtt_writer.for(pkt)

    wrt.push(_c_mqtt_proto)
    wrt.u8( mqtt_level )

    let {will, username, password} = pkt
    let flags = wrt.flags(
      pkt.flags,
      _enc_flags_connect,
      0 | (username ? 0x80 : 0)
        | (password ? 0x40 : 0)
        | (will ? _enc_flags_will(will) : 0) )

    wrt.u16(pkt.keep_alive)

    if (5 <= mqtt_level)
      wrt.props(pkt.props)


    wrt.utf8(pkt.client_id)
    if (flags & 0x04) { // .will_flag
      if (5 <= mqtt_level)
        wrt.props(will.props)

      wrt.utf8(will.topic)
      wrt.bin(will.payload)
    }

    if (flags & 0x80) // .username
      wrt.utf8(username)

    if (flags & 0x40) // .password
      wrt.bin(password)

    return wrt.as_pkt(0x10)
  }
}

export function mqtt_decode_connect(ns, mqtt_reader) {
  class _connect_flags_ extends Number {
    get reserved() { return this & 0x01 !== 0 }
    get clean_start() { return this & 0x02 !== 0 }
    get will_flag() { return this & 0x04 !== 0 }
    get will_qos() { return (this >>> 3) & 0x3 }
    get will_retain() { return this & 0x20 !== 0 }
    get password() { return this & 0x40 !== 0 }
    get username() { return this & 0x80 !== 0 }
  }

  return ns[0x1] = (pkt, u8_body) => {
    let rdr = mqtt_reader.for(pkt, u8_body)
    if ('MQTT' !== rdr.utf8())
      throw new Error('Invalid mqtt_connect packet')

    pkt.__proto__.mqtt_level =
      pkt.mqtt_level = rdr.u8()

    let flags = pkt.flags =
      rdr.flags(_connect_flags_)

    pkt.keep_alive = rdr.u16()

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props()



    pkt.client_id = rdr.utf8()
    if (flags.will_flag) {
      let will = pkt.will = {}
      if (5 <= pkt.mqtt_level)
        will.props = rdr.props()

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
