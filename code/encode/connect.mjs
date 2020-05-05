import {mqtt_type_writer} from './_utils.mjs'

const _c_mqtt_proto = new Uint8Array([
  0, 4, 0x4d, 0x51, 0x54, 0x54 ])

export function mqtt_encode_connect(ns) {
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
    const wrt = new mqtt_type_writer()

    wrt.push(_c_mqtt_proto)
    wrt.u8( mqtt_level )

    const {will} = pkt
    const flags = wrt.u8_flags(
      pkt.flags,
      _enc_flags_connect,
      will ? _enc_flags_will(will) : 0 )

    wrt.u16(pkt.keep_alive)

    if (5 <= mqtt_level)
      wrt.props(pkt.props)


    wrt.utf8(pkt.client_id)
    if (flags & 0x04) { // .will_flag
      if (5 <= mqtt_level)
        wrt.props(will.properties)

      wrt.utf8(will.topic)
      wrt.bin(will.payload)
    }

    if (flags & 0x80) // .username
      wrt.utf8(pkt.username)

    if (flags & 0x40) // .password
      wrt.bin(pkt.password)

    return wrt.as_pkt(0x10)
  }
}
