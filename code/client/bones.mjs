import {_mqtt_client_conn} from './_conn.mjs'
export * from './_conn.mjs'

export class MQTTBonesClient {
  constructor(opt={}) {
    if ('function' === typeof opt)
      opt = {on_mqtt: opt}

    const {on_mqtt, on_live} = opt
    if (on_mqtt)
      this.on_mqtt = on_mqtt
    if (on_live)
      this.on_live = on_live

    this._conn_ = _mqtt_client_conn(this)
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
    const {_conn_} = this
    const on_mqtt_chunk = _conn_.set(
      this._mqtt_session(),
      write_u8_pkt)

    this._msg_loop = (async ()=>{
        async_iter = await async_iter
        for await (let chunk of async_iter)
          on_mqtt_chunk(chunk)
        this._conn_.reset()
      })()

    return this
  }

  static with(mqtt_session) {
    this.prototype._mqtt_session = mqtt_session
    return this
  }
}
