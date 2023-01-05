
export function mqtt_encode_pingxxx(ns, mqtt_writer) {
  ns.pingreq  = () => new Uint8Array([ 0xc0, 0 ])
  ns.pingresp = () => new Uint8Array([ 0xd0, 0 ])
}

