import { connect as tcp_connect } from 'node:net'
import { MQTTBones } from './integ_bones_core.js'


export class MQTTNodejsBones extends MQTTBones {
  with_tcp(...args) {
    let sock = args.length
      ? tcp_connect(...args)
      : tcp_connect(1883)
    return this.with_stream(sock)
  }

  with_stream(read_stream, write_stream) {
    if (undefined === write_stream)
      write_stream = read_stream

    read_stream.once('end', this._conn_.reset)
    return this.with_async_iter(read_stream,
      u8_pkt => write_stream.write(u8_pkt))
  }
}
