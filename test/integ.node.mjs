import { MQTTNodejsBones } from './integ_bones_nodejs.mjs'
import { integ_suite } from './integtests.mjs'

const integ_configs = [
  //{test_name: 'v4 with localhost:1883', port: 1883, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v4()},
  //{test_name: 'v5 with localhost:1883', port: 1883, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v5()},

  {test_name: 'v4 with Mosquitto v1.6 in Docker', port: 9883, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v4()},
  {test_name: 'v5 with Mosquitto v1.6 in Docker', port: 9883, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v5()},

  {test_name: 'v4 with Mosquitto v2.0 in Docker', port: 9893, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v4()},
  {test_name: 'v5 with Mosquitto v2.0 in Docker', port: 9893, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v5()},

  {test_name: 'v4 with EJabberD in Docker', port: 5883, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v4()},
  {test_name: 'v5 with EJabberD in Docker', port: 5883, host: '127.0.0.1', MQTTClient: MQTTNodejsBones.v5()},

  //{test_name: 'v4 with test.mosquitto.org', port: 1883, host: 'test.mosquitto.org', MQTTClient: MQTTNodejsBones.v4()},
  //{test_name: 'v5 with test.mosquitto.org', port: 1883, host: 'test.mosquitto.org', MQTTClient: MQTTNodejsBones.v5()},
]

for (let cfg of integ_configs)
  describe(`Integ with TCP: ${cfg.test_name}`, () => {
    integ_suite(cfg.ms_delay || 5, opt =>
      new cfg.MQTTClient(opt)
        .with_tcp(cfg.port, cfg.host) )
  })

