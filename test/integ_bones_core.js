import { mqtt_opts_v5, mqtt_pkt_ctx } from 'u8-mqtt-packet'
const mqtt_ctx_v4 = mqtt_pkt_ctx(4, mqtt_opts_v5)
const mqtt_ctx_v5 = mqtt_pkt_ctx(5, mqtt_opts_v5)


export class MQTTBones {
  static v4() { return class extends this { mqtt_ctx = mqtt_ctx_v4 } }
  static v5() { return class extends this { mqtt_ctx = mqtt_ctx_v5 } }

  constructor(opt={}) {
    Object.assign(this, opt)
    this._conn_ = _client_conn(this)
    this.on_mqtt([], {mqtt:this})
  }

  auth(pkt) { return this._send('auth', pkt) }
  connect(pkt) { return this._conn_.send_connect('connect', pkt) }
  disconnect(pkt) { return this._send('disconnect', pkt) }

  ping() { return this._send('pingreq') }

  subscribe(pkt) { return this._send('subscribe', pkt) }
  unsubscribe(pkt) { return this._send('unsubscribe', pkt) }

  puback(pkt) { return this._send('puback', pkt) }
  publish(pkt) { return this._send('publish', pkt) }

  // _send(type, pkt) -- provided by _conn_ and transport
  on_mqtt(/*pkt_list, ctx*/) {}
  on_live(/*client*/) {}

  with_async_iter(async_iter, write_u8_pkt) {
    let {_conn_} = this
    let on_mqtt_chunk = _conn_.set(
      this.mqtt_ctx,
      write_u8_pkt)

    this._msg_loop = (async ()=>{
        async_iter = await async_iter
        for await (let chunk of async_iter)
          on_mqtt_chunk(chunk)
        this._conn_.reset()
      })()

    return this
  }
}



function _client_conn(client) {
  let q0 = _tiny_deferred_queue()
  let q = _tiny_deferred_queue()

  let _asy_send = async (type, pkt) =>
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

    set(mqtt_ctx, send_u8_pkt) {
      mqtt_ctx = mqtt_ctx.mqtt_stream()

      let on_mqtt_chunk = u8_buf =>
        client.on_mqtt(
          mqtt_ctx.decode(u8_buf),
          {mqtt: client})

      _send = async (type, pkt) =>
        send_u8_pkt(
          mqtt_ctx.encode_pkt(type, pkt) )


      q0.notify(_send)
      _async_evt(client, client.on_live)

      return on_mqtt_chunk
    }
  }
}

async function _async_evt(obj, evt) {
  // microtask break
  if (undefined !== evt)
    await evt.call(obj, await obj)
}
function _tiny_deferred_queue() {
  let q = [] // tiny resetting deferred queue
  q.then = y => { q.push(y) }
  q.notify = v => { for (let fn of q.splice(0,q.length)) fn(v) }
  return q
}

