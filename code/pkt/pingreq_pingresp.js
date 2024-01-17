
export function mqtt_encode_pingxxx(ns) {
  ns.pingreq  = () => new Uint8Array([ 0xc0, 0 ])
  ns.pingresp = () => new Uint8Array([ 0xd0, 0 ])
}


export function mqtt_decode_pingxxx(ns) {
  return ns[0xc] = ns[0xd] = pkt => pkt
}
