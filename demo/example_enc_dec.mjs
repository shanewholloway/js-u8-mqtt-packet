import {mqtt_encode_session} from 'u8-mqtt-packet'
const mqtt_encode = mqtt_encode_session(4)

const u8_pkt = mqtt_encode('connect', {
  keep_alive: 60,
  flags: 0,
  client_id: 'readme',
})

console.log(u8_pkt)

/*
  Uint8Array(20) [16,18,0,4,77,81,84,84,4,0,0,60,0,6,114,101,97,100,109,101]
*/


import {mqtt_decode_session} from 'u8-mqtt-packet'
const mqtt_decode = mqtt_decode_session()
const pkt_list = mqtt_decode(u8_pkt)
console.log(pkt_list)

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
