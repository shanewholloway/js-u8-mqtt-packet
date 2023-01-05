import {encode_varint} from '../mqtt_varint.mjs'

export function mqtt_pkt_writer_pool() {
  let _pool_ = []
  return host =>
    0 === _pool_.length
      ? mqtt_pkt_writer(host, _pool_)
      : _pool_.pop()(host)
}

export function mqtt_pkt_writer(host, _pool_) {
  // avoid GCing push/pull when they can be reused
  let n=0, rope=[]
  return install(host)

  function install(_host) {
    host = _host
    host.push = push
    host.pack = pack
  }

  function push(u8) {
    rope.push(u8)
    n += u8.length
  }

  function pack(hdr) {
    host = host.push = host.pack = null

    let res = _mqtt_pkt_rope(hdr, n, rope)
    n=0; rope=[]
    if (undefined !== _pool_)
      _pool_.push(install)

    return res
  }
}


export function _mqtt_pkt_rope(hdr, n, rope) {
  let header = encode_varint(n, hdr)
  let i = header.length

  let pkt = new Uint8Array(n + i)
  pkt.set(header, 0)
  for (let vec of rope) {
    pkt.set(vec, i)
    i += vec.length
  }
  return pkt
}
