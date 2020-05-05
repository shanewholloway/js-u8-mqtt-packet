import {connect as tcp_connect} from 'net'
import {MQTTBonesClient} from './bones.mjs'
export * from './bones.mjs'


export class MQTTBonesNodeClient extends MQTTBonesClient {
  with_tcp(...args) {
    let sock = args.length
      ? tcp_connect(...args)
      : tcp_connect(1883)
    return this.with_stream(sock)
  }

  async with_stream(stream) {
    const {_conn_} = this
    const on_mqtt_chunk = _conn_.set(
      this.mqtt_session,
      u8_pkt => stream.write(u8_pkt))

    stream.once('end', _conn_.reset)

    this._msg_loop = (async ()=>{
        for await (let chunk of stream)
          on_mqtt_chunk(chunk)
      })()

    return this
  }
}

