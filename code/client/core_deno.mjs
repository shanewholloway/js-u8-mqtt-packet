//import {connect as tcp_connect} from 'net'
import {MQTTBonesClient} from './bones.mjs'
export * from './bones.mjs'


export class MQTTBonesDenoClient extends MQTTBonesClient {
  with_tcp(port, hostname) {
    if (! Number.isFinite(port)) {
      ({port, host: hostname} = port)
    }

    Deno.connect({
      port: port || 1883, hostname,
      transport: 'tcp' })
    .then(conn =>
      this.with_async_iter(
        Deno.iter(conn),
        u8_pkt => conn.write(u8_pkt)) )

    return this
  }
}

