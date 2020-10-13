import {MQTTBonesNode_v4, MQTTBonesNode_v5} from 'u8-mqtt-packet/esm/client/node.mjs'
import {integ_suite} from './integtests.mjs'

const integ_configs = [
  {test_name: 'v4 with localhost', port: 1883, host: '127.0.0.1', MQTTClient: MQTTBonesNode_v4},
  {test_name: 'v5 with localhost', port: 1883, host: '127.0.0.1', MQTTClient: MQTTBonesNode_v5},

  {test_name: 'v4 with Mosquitto in Docker', port: 9883, host: '127.0.0.1', MQTTClient: MQTTBonesNode_v4},
  {test_name: 'v5 with Mosquitto in Docker', port: 9883, host: '127.0.0.1', MQTTClient: MQTTBonesNode_v5},

  {test_name: 'v4 with EJabberD in Docker', port: 5883, host: '127.0.0.1', MQTTClient: MQTTBonesNode_v4},
  {test_name: 'v5 with EJabberD in Docker', port: 5883, host: '127.0.0.1', MQTTClient: MQTTBonesNode_v5},

  //{test_name: 'v4 with test.mosquitto.org', port: 1883, host: 'test.mosquitto.org', MQTTClient: MQTTBonesNode_v4},
  //{test_name: 'v5 with test.mosquitto.org', port: 1883, host: 'test.mosquitto.org', MQTTClient: MQTTBonesNode_v5},
]

for (let cfg of integ_configs)
  describe(`Integ with TCP: ${cfg.test_name}`, () => {
    integ_suite(cfg.ms_delay || 5, opt =>
      new cfg.MQTTClient(opt)
        .with_tcp(cfg.port, cfg.host) )
  })

