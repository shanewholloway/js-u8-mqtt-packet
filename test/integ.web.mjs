import {MQTTBonesWeb_v4, MQTTBonesWeb_v5} from 'u8-mqtt-packet/esm/client/web.js'
import {integ_suite} from './integtests.mjs'

const integ_configs = [
  //{test_name: 'v4 with localhost', url: 'ws://127.0.0.1:9001', MQTTClient: MQTTBonesWeb_v4, ms_delay: 20},
  //{test_name: 'v5 with localhost', url: 'ws://127.0.0.1:9001', MQTTClient: MQTTBonesWeb_v5, ms_delay: 20},

  {test_name: 'v4 with Mosquitto v1.6 in Docker', url: 'ws://127.0.0.1:9880', MQTTClient: MQTTBonesWeb_v4, ms_delay: 35},
  {test_name: 'v5 with Mosquitto v1.6 in Docker', url: 'ws://127.0.0.1:9880', MQTTClient: MQTTBonesWeb_v5, ms_delay: 35},

  {test_name: 'v4 with Mosquitto v2.0 in Docker', url: 'ws://127.0.0.1:9890', MQTTClient: MQTTBonesWeb_v4, ms_delay: 35},
  {test_name: 'v5 with Mosquitto v2.0  in Docker', url: 'ws://127.0.0.1:9890', MQTTClient: MQTTBonesWeb_v5, ms_delay: 35},

  {test_name: 'v4 with EJabberD in Docker', url: 'ws://127.0.0.1:5880/mqtt', MQTTClient: MQTTBonesWeb_v4, ms_delay: 20},
  {test_name: 'v5 with EJabberD in Docker', url: 'ws://127.0.0.1:5880/mqtt', MQTTClient: MQTTBonesWeb_v5, ms_delay: 20},

  //{test_name: 'v4 with test.mosquitto.org', url: 'wss://test.mosquitto.org:8081', MQTTClient: MQTTBonesWeb_v4, ms_delay: 80},
  //{test_name: 'v5 with test.mosquitto.org', url: 'wss://test.mosquitto.org:8081', MQTTClient: MQTTBonesWeb_v5, ms_delay: 80},
]

for (let cfg of integ_configs)
  describe(`Integ with WebSocket: ${cfg.test_name}`, () => {
    integ_suite(cfg.ms_delay || 33, opt =>
      new cfg.MQTTClient(opt)
        .with_websock(cfg.url) ) 
  })
