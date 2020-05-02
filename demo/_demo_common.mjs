
export const delay = ms => new Promise(y => setTimeout(y,ms))


export function on_mqtt(pkt_list, my_mqtt) {
  for (const pkt of pkt_list) {
    const {type_obj: {type}, u8_body, b0, id, cmd, ... tip} = pkt
    console.log(`%c[mqtt ${type}]: %o`, 'color: blue', tip)
  }
}


export async function somewhere_in_your_code(my_mqtt) {
  my_mqtt.connect({
    client_id: `u8-mqtt-packet-demo [${sess_id()}]`,
    flags: { clean_start: true },
  })

  await delay(10)

  my_mqtt.publish({
    topic: 'u8-mqtt-packet/test-topic',
    payload: 'awesome from node or web',
  })
}


export async function demo_in_your_code(my_mqtt) {
  await somewhere_in_your_code(my_mqtt)

  await delay(10)

  my_mqtt.disconnect()
}


let _sess_id = null
export function sess_id() {
  let res = sess_id.res
  if (!res) {
    res = Math.random().toString(36).slice(2)

    if ('undefined' !== typeof sessionStorage) {
      let k ='u8-mqtt-demo sess_id'
      let prev = sessionStorage.get(k)
      if (undefined === k)
        sessionStorage.set(k, res)
      else res = prev
    }
  }

  return res
}

