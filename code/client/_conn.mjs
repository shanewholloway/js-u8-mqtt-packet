
export function _mqtt_client_conn(client) {
  const q0 = _tiny_deferred_queue()
  const q = _tiny_deferred_queue()

  const _asy_send = async (type, pkt) =>
    (await q)(type, pkt)
  let _send = client._send = _asy_send

  return {
    is_live: ()=> _asy_send !== _send,
    reset() { client._send = _send = _asy_send },

    async send_connect(... args) {
      if (_asy_send === _send)
        _send = await q0

      let res = _send(...args)

      // microtask break between connect and following packets
      await null

      client._send = _send
      q.notify(_send)
      return res
    },

    set(mqtt_session, send_u8_pkt) {
      const [mqtt_decode, mqtt_encode] =
        mqtt_session()

      const on_mqtt_chunk = u8_buf =>
        client.on_mqtt(
          mqtt_decode(u8_buf),
          {mqtt: client})

      _send = async (type, pkt) =>
        send_u8_pkt(
          mqtt_encode(type, pkt) )


      q0.notify(_send)

      // call client.on_live in next promise microtask
      Promise.resolve(client).then(client.on_live)

      return on_mqtt_chunk
    }
  }
}

function _tiny_deferred_queue() {
  const q = [] // tiny resetting deferred queue
  q.then = y => { q.push(y) }
  q.notify = v => { for (const fn of q.splice(0,q.length)) fn(v) }
  return q
}

