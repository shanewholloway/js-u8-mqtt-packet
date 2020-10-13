//import {connect as tcp_connect} from 'net'
import {MQTTBonesClient} from './bones.mjs'
export * from './bones.mjs'


export class MQTTBonesDenoClient extends MQTTBonesClient {
  with_tcp(port, hostname) {
    if (! Number.isFinite(port)) {
      ({port, host: hostname} = port)
    }

    const conn = Deno.connect({
      port: port || 1883, hostname,
      transport: 'tcp' })

    return this.with_async_iter(
      conn.then(conn => Deno.iter(conn)),
      async u8_pkt => (await conn).write(u8_pkt))
  }
}

