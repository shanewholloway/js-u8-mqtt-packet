
export function _mqtt_client_conn(client) {
  const q = [] // tiny version of deferred
  q.then = y => void q.push(y)
  q.notify = v => { for (const fn of q.splice(0,q.length)) fn(v) }

  const send0 = async (type, pkt) =>
    (await q)(type, pkt)

  client._send = send0
  return {
    is_live: ()=> send0 !== client._send,
    reset() { client._send = send0 },

    set(mqtt_session, send_u8_pkt) {
      const [mqtt_decode, mqtt_encode] =
        mqtt_session()

      const ctx = {mqtt: client}
      const on_mqtt_chunk = u8_buf =>
        client.on_mqtt(
          mqtt_decode(u8_buf),
          ctx)

      const send_pkt = async (type, pkt) =>
        send_u8_pkt(
          mqtt_encode(type, pkt) )


      client._send = send_pkt
      q.notify(send_pkt)
      return on_mqtt_chunk
    }
  }
}