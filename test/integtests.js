import {describe, it} from '#test_bdd'
import {assert, expect} from 'chai'

let sym_integ_log = Symbol('u8-mqtt::integ test log')

export function integ_suite(ms_delay, _new_mqtt) {
  const delay = n =>
    new Promise(y => setTimeout(y, n*ms_delay))

  const init_mqtt = () => new Promise(done => {
      let integ_log = []
      let my_mqtt = _new_mqtt({on_live: done, on_mqtt})
      my_mqtt[sym_integ_log] = integ_log

      async function on_mqtt(pkt_list, ctx) {
        for (let pkt of pkt_list)
          integ_log.push(pkt.type)

        await null
        if (ctx.mqtt !== my_mqtt)
          throw new Error('expected ctx.mqtt === my_mqtt')
      }
    })

  it('connect / disconnect', async () => {
    let my_mqtt = await init_mqtt()

    let my_id = Math.random().toString(36).slice(2)
    await my_mqtt.connect({
      client_id: `u8-mqtt-packet-integ-${my_id}`,
      keep_alive: 60,
      flags: { clean_start: true } })

    await delay(4)

    await my_mqtt.disconnect()

    await delay(3)

    await my_mqtt._msg_loop

    let tags = new Set(my_mqtt[sym_integ_log])
    assert.equal(
      [... tags].sort().join(' '),
      'connack')
  })

  it('subscribe / publish', async () => {
    let my_mqtt = await init_mqtt()

    let my_id = Math.random().toString(36).slice(2)
    await my_mqtt.connect({
      client_id: `u8-mqtt-packet-integ-${my_id}`,
      keep_alive: 60,
      flags: { clean_start: true } })

    await delay(4)

    await my_mqtt.subscribe({
      pkt_id: 10,
      topics: ['u8-mqtt-packet/+']})

    await delay()

    await my_mqtt.publish({
      topic: 'u8-mqtt-packet/test-topic',
      payload: 'awesome from node or web' })

    await delay()

    await my_mqtt.publish({
      topic: `u8-mqtt-packet/hello-from/${my_id}`,
      payload: `Hello from ${my_id}` })

    await delay()

    await my_mqtt.disconnect()

    await delay(3)

    await my_mqtt._msg_loop

    let tags = new Set(my_mqtt[sym_integ_log])
    assert.equal(
      [... tags].sort().join(' '),
      'connack publish suback')
  })
}

