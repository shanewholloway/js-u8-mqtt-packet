import {mqtt_session} from 'u8-mqtt-packet'
const [mqtt_decode, mqtt_encode] = mqtt_session()

const u8_pkt = mqtt_encode('connect', {
  keep_alive: 60,
  flags: 0,
  client_id: 'readme',
})

console.log(u8_pkt)

/*
  Uint8Array(20) [16,18,0,4,77,81,84,84,4,0,0,60,0,6,114,101,97,100,109,101]
*/


console.log(mqtt_decode(u8_pkt))

/*
  [
    {
      b0: 16,
      cmd: 16,
      hdr: 0,
      type_obj: { type: 'connect', cmd: 16, id: 1 },
      u8_body: Uint8Array(18) [
         0,   4,  77,  81, 84,  84,   4,
         0,   0,  60,   0,  6, 114, 101,
        97, 100, 109, 101
      ],
      mqtt_level: 4,
      flags: [Number (_flags_): 0],
      keep_alive: 60,
      client_id: 'readme'
    }
  ]
*/
