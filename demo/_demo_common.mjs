
export const delay = ms => new Promise(y => setTimeout(y,ms))


export function on_mqtt(pkt_list, {mqtt: my_mqtt}) {
  for (const pkt of pkt_list) {
    const {type, ... tip} = pkt
    console.log(`%c[mqtt ${type}]: %o`, 'color: blue', tip)
  }
}

export async function somewhere_in_your_code(my_mqtt) {
  const my_id = sess_id()

  await delay(10)

  my_mqtt.connect({
    keep_alive: 60,
    client_id: `u8-mqtt-packet-${my_id}-`,
    flags: { clean_start: true } })

  await delay(10)

  my_mqtt.subscribe({
    pkt_id: 10,
    topics: ['u8-mqtt-packet/+']})

  await delay(10)

  my_mqtt.publish({
    topic: 'u8-mqtt-packet/test-topic',
    payload: 'awesome from node or web' })

  await delay(10)

  my_mqtt.publish({
    topic: `u8-mqtt-packet/hello-from/${my_id}`,
    payload: `Hello from ${my_id}` })
}


export async function demo_in_your_code(my_mqtt) {
  await somewhere_in_your_code(my_mqtt)

  await delay(10)

  my_mqtt.disconnect()
}


export function sess_id() {
  let res = sess_id.id

  if (!res) {
    res = Math.random().toString(36).slice(2)

    if ('undefined' !== typeof sessionStorage) {
      let k ='u8-mqtt-demo sess_id'
      let prev = sessionStorage.getItem(k)
      if (!prev)
        sessionStorage.setItem(k, res)
      else res = prev
    }
    sess_id.id = res
  }

  return res
}

