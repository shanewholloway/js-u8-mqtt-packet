
export const [mqtt_cmd_by_type, mqtt_type_entries] = (()=>{

  const entries = [
    [ 0x0, 'reserved'],
    [ 0x1, 'connect'],
    [ 0x2, 'connack'],
    [ 0x3, 'publish'],
    [ 0x4, 'puback'],
    [ 0x5, 'pubrec'],
    [ 0x6, 'pubrel'],
    [ 0x7, 'pubcomp'],
    [ 0x8, 'subscribe'],
    [ 0x9, 'suback'],
    [ 0xa, 'unsubscribe'],
    [ 0xb, 'unsuback'],
    [ 0xc, 'pingreq'],
    [ 0xd, 'pingresp'],
    [ 0xe, 'disconnect'],
    [ 0xf, 'auth'],
  ]

  const type_map = new Map()
  for (const [id, type] of entries) {
    const cmd = id << 4
    type_map.set(cmd, {type, cmd, id})
  }

  return [
    type_map.get.bind(type_map),
    Array.from(type_map.values()) ]
})();
