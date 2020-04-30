//import MQTTClient from 'u8-mqtt-packet/esm/client/web.mjs'
import MQTTClient from '../esm/client/web.min.mjs'

const delay = ms => new Promise(y => setTimeout(y,ms))

async function main() {
  const my_mqtt = new MQTTClient({
    mqtt_pkt(pkt) {
      const {type_obj, u8_body, b0, cmd, ... tip} = pkt
      console.log(`%c[mqtt ${type_obj.type}]: %o`, 'color: blue', tip)
    },
  })

  my_mqtt.with_websock('ws://127.0.0.1:9001')

  await my_mqtt.connect({
    connect_flags: {
      will_flag: 1, will_qos: 0,
    },
    keep_alive: 60,

    client_id: 'swh_demo',
    will: {
      topic: 'swh/aaa/awesome',
      payload: 'last will is awesome',
    }})

  await delay(10)

  await my_mqtt.publish({
    topic: 'swh/test-topic',
    payload: 'awesome from node',
  })

  await delay(10)

  await my_mqtt.disconnect()
}

main()
