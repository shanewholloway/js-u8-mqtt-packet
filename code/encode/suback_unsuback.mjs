import {mqtt_type_writer} from './_utils.mjs'

export function mqtt_encode_xxsuback(ns) {
  ns.suback = _enc_xxsuback(0x90)
  ns.unsuback = _enc_xxsuback(0xb0)


  function _enc_xxsuback(hdr) {
    return ( mqtt_level, pkt ) => {
      const wrt = new mqtt_type_writer()

      wrt.u16(pkt.pkt_id)
      if (5 <= pkt.mqtt_level)
        wrt.props(pkt.props)

      for (const ans of pkt.answers)
        wrt.u8_reason(ans)

      return wrt.as_pkt(hdr)
    }
  }
}
