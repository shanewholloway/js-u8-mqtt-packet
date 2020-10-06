import {MQTTBonesClient} from './bones.mjs'
export * from './bones.mjs'

export class MQTTBonesWebClient extends MQTTBonesClient {
  with_websock(websock) {
    if (null == websock)
      websock = 'ws://127.0.0.1:9001'

    if ('string' === typeof websock || websock.origin)
      websock = new WebSocket(new URL(websock), ['mqtt'])

    websock.binaryType = 'arraybuffer'

    let ready = true, {readyState} = websock
    if (1 !== readyState) {
      if (0 !== readyState)
        throw new Error('Invalid WebSocket readyState')

      ready = new Promise( y =>
        websock.addEventListener('open', y, {once: true}))
    }


    const {_conn_} = this
    const on_mqtt_chunk = _conn_.set(
      this._mqtt_session(),
      async u8_pkt => (
        await ready,
        websock.send(u8_pkt)) )

    websock.addEventListener('close',
      ()=> {
        delete websock.onmessage
        _conn_.reset()
      }, {once: true})

    websock.onmessage = evt =>
      on_mqtt_chunk(
        // convert from ArrayBuffer to u8
        new Uint8Array(evt.data) )

    return this
  }
}
