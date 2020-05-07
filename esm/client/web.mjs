function encode_varint(n, a=[]) {
  do {
    const ni = n & 0x7f;
    n >>>= 7;
    a.push( ni | (0===n ? 0 : 0x80) );
  } while (n > 0)
  return a
}


/*
export function decode_varint_loop(u8, vi=0, vi_tuple=[]) {
  let shift = 0, n = (u8[vi] & 0x7f)
  while ( 0x80 & u8[vi++] )
    n |= (u8[vi] & 0x7f) << (shift += 7)

  vi_tuple[0] = n
  vi_tuple[1] = vi
  return vi_tuple
}
*/


function decode_varint(u8, vi=0, vi_tuple=[]) {
  // unrolled for a max of 4 chains
  let n = (u8[vi] & 0x7f) <<  0;
  if ( 0x80 & u8[vi++] ) {
    n |= (u8[vi] & 0x7f) <<  7;
    if ( 0x80 & u8[vi++] ) {
      n |= (u8[vi] & 0x7f) << 14;
      if ( 0x80 & u8[vi++] ) {
        n |= (u8[vi] & 0x7f) << 21;
      }
    }
  }

  vi_tuple[0] = n;
  vi_tuple[1] = vi;
  return vi_tuple
}

function _mqtt_raw_pkt_decode_v(by_ref) {
  const [u8] = by_ref;
  const [len_body, len_vh] = decode_varint(u8, 1);

  const len_pkt = len_body + len_vh;
  if ( u8.byteLength >= len_pkt ) {

    by_ref[0] = u8.subarray(len_pkt);
    by_ref[1] = u8[0];
    by_ref[2] = 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt);

  } else by_ref.length = 1; // truncate

  return by_ref
}


function _mqtt_raw_pkt_dispatch(decode_raw_pkt) {
  const l = [new Uint8Array(0)]; // reuse array to prevent garbage collection churn on ephemeral ones
  return u8_buf => {
    l[0] = 0 === l[0].byteLength
      ? u8_buf : _u8_join(l[0], u8_buf);

    const res = [];
    do {
      _mqtt_raw_pkt_decode_v(l);
      if (1 === l.length)
        return res

      const pkt = decode_raw_pkt(l[1], l[2]);
      if (undefined !== pkt && null !== pkt)
        res.push( pkt );
    } while (1)
  }
}


function _u8_join(a, b) {
  const alen = a.byteLength;
  const r = new Uint8Array(alen + b.byteLength);
  r.set(a, 0);
  r.set(b, alen);
  return r
}

const [mqtt_props_by_id, mqtt_props_entries] = (()=>{
  const entries = [
    [ 0x01, 'u8',   'payload_format_indicator'],
    [ 0x02, 'u32',  'message_expiry_interval'],
    [ 0x03, 'utf8', 'content_type'],
    [ 0x08, 'utf8', 'response_topic'],
    [ 0x09, 'bin',  'correlation_data'],
    [ 0x0B, 'vint', 'subscription_identifier'],
    [ 0x11, 'u32',  'session_expiry_interval'],
    [ 0x12, 'utf8', 'assigned_client_identifier'],
    [ 0x13, 'u16',  'server_keep_alive'],
    [ 0x15, 'utf8', 'authentication_method'],
    [ 0x16, 'bin',  'authentication_data'],
    [ 0x17, 'u8',   'request_problem_information'],
    [ 0x18, 'u32',  'will_delay_interval'],
    [ 0x19, 'u8',   'request_response_information'],
    [ 0x1A, 'utf8', 'response_information'],
    [ 0x1C, 'utf8', 'server_reference'],
    [ 0x1F, 'utf8', 'reason_string'],
    [ 0x21, 'u16',  'receive_maximum'],
    [ 0x22, 'u16',  'topic_alias_maximum'],
    [ 0x23, 'u16',  'topic_alias'],
    [ 0x24, 'u8',   'maximum_qo_s'],
    [ 0x25, 'u8',   'retain_available'],
    [ 0x26, 'pair', 'user_properties', true],
    [ 0x27, 'u32',  'maximum_packet_size'],
    [ 0x28, 'u8',   'wildcard_subscription_available'],
    [ 0x29, 'u8',   'subscription_identifiers_available', true],
    [ 0x2A, 'u8',   'shared_subscription_available'],
  ];


  const prop_map = new Map();
  for (const [id, type, name, plural] of entries) {
    const prop_obj = {id, type, name};
    //if (plural) prop_obj.plural = plural
    prop_map.set(prop_obj.id, prop_obj);
    prop_map.set(prop_obj.name, prop_obj);
  }

  return [
    prop_map.get.bind(prop_map),
    new Set( prop_map.values() ) ]
})();

const as_utf8 = u8 =>
  new TextDecoder('utf-8').decode(u8);

const step_from = idx =>
  (width, r) => ( r = idx, idx += width, r );

class mqtt_type_reader {
  constructor(buf, idx=0) {
    this.buf = buf;
    this.step = step_from(idx);
  }

  _fork(buf, idx) {
    return { __proto__: this, buf, step: step_from(idx) }
  }

  has_more() {
    const {buf, step} = this;
    return buf.byteLength > step(0)
  }

  u8() {
    const {buf, step} = this;
    return buf[step(1)]
  }

  u16() {
    const {buf, step} = this;
    const i = step(2);
    return (buf[i]<<8) | buf[i+1]
  }

  u32() {
    const {buf, step} = this;
    const i = step(4);
    return (buf[i]<<24) | (buf[i+1]<<16) | (buf[i+2]<<8) | buf[i+3]
  }

  vint() {
    const {buf, step} = this;
    const [n, vi] = decode_varint(buf, step(0));
    step(vi);
    return n
  }

  bin() {
    const {buf, step} = this;
    const i = step(2);
    const len = (buf[i]<<8) | buf[i+1];
    const i0 = step(len);
    return buf.subarray(i0, i0+len)
  }

  utf8() { return as_utf8(this.bin()) }
  pair() { return [ as_utf8(this.bin()), as_utf8(this.bin()) ] }

  u8_flags(FlagsType) {
    const {buf, step} = this;
    return new FlagsType(buf[step(1)])
  }

  u8_reason(fn_reason) {
    const {buf, step} = this;
    return fn_reason( buf[step(1)] )
  }

  flush() {
    const {buf, step} = this;
    this.step = this.buf = null;
    return buf.subarray(step(0))
  }

  props() {
    const {buf, step} = this;

    const [len, vi] = decode_varint(buf, step(0));
    const end_part = vi + len;
    step(end_part);
    if (0 === len)
      return null

    const prop_entries = [];
    const rdr = this._fork(
      buf.subarray(vi, end_part) );

    while (rdr.has_more()) {
      const {name, type} = mqtt_props_by_id( rdr.u8() );
      const value = rdr[type]();
      prop_entries.push([ name, value ]);
    }

    return prop_entries
  }
}



class U8_Reason extends Number {
  constructor(u8, reason) { super(u8); this.reason = reason; }
}

function bind_reason_lookup(reason_entries) {
  const reason_map = new Map();
  for (const [u8, reason] of reason_entries)
    reason_map.set( u8, new U8_Reason(u8, reason) );

  return reason_map.get.bind(reason_map)
}

function mqtt_decode_connect(ns) {
  class _connect_flags_ extends Number {
    get reserved() { return this & 0x01 !== 0 }
    get clean_start() { return this & 0x02 !== 0 }
    get will_flag() { return this & 0x04 !== 0 }
    get will_qos() { return (this >>> 3) & 0x3 }
    get will_retain() { return this & 0x20 !== 0 }
    get password() { return this & 0x40 !== 0 }
    get username() { return this & 0x80 !== 0 }
  }


  return ns[0x1] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0);
    if ('MQTT' !== rdr.utf8())
      throw new Error('Invalid mqtt_connect packet')

    pkt._base_.mqtt_level = pkt.mqtt_level = rdr.u8();

    const flags = pkt.flags =
      rdr.u8_flags(_connect_flags_);

    pkt.keep_alive = rdr.u16();

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();



    pkt.client_id = rdr.utf8();
    if (flags.will_flag) {
      const will = pkt.will = {};
      if (5 <= pkt.mqtt_level)
        will.properties = rdr.props();

      will.topic = rdr.utf8();
      will.payload = rdr.bin();
      will.qos = flags.will_qos;
      will.retain = flags.will_retain;
    }

    if (flags.username)
      pkt.username = rdr.utf8();

    if (flags.password)
      pkt.password = rdr.bin();
    return pkt }
}

function mqtt_decode_connack(ns) {
  class _connack_flags_ extends Number {
    get session_present() { return this & 0x01 !== 0 }
  }

  const _connack_reason_ = bind_reason_lookup([
    // MQTT 3.1.1
    [ 0x00, 'Success'],
    [ 0x01, 'Connection refused, unacceptable protocol version'],
    [ 0x02, 'Connection refused, identifier rejected'],
    [ 0x03, 'Connection refused, server unavailable'],
    [ 0x04, 'Connection refused, bad user name or password'],
    [ 0x05, 'Connection refused, not authorized'],

    // MQTT 5.0
    [ 0x81, 'Malformed Packet'],
    [ 0x82, 'Protocol Error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x84, 'Unsupported Protocol Version'],
    [ 0x85, 'Client Identifier not valid'],
    [ 0x86, 'Bad User Name or Password'],
    [ 0x87, 'Not authorized'],
    [ 0x88, 'Server unavailable'],
    [ 0x89, 'Server busy'],
    [ 0x8A, 'Banned'],
    [ 0x8C, 'Bad authentication method'],
    [ 0x90, 'Topic Name invalid'],
    [ 0x95, 'Packet too large'],
    [ 0x97, 'Quota exceeded'],
    [ 0x99, 'Payload format invalid'],
    [ 0x9A, 'Retain not supported'],
    [ 0x9B, 'QoS not supported'],
    [ 0x9C, 'Use another server'],
    [ 0x9D, 'Server moved'],
    [ 0x9F, 'Connection rate exceeded'],
  ]);


  return ns[0x2] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0);

    const flags = pkt.flags =
      rdr.u8_flags(_connack_flags_);

    pkt.reason = rdr.u8_reason(_connack_reason_);
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();
    return pkt }
}

function mqtt_decode_publish(ns) {
  return ns[0x3] = (pkt, u8_body) => {
    const {hdr} = pkt;
    pkt.dup = Boolean(hdr & 0x8);
    pkt.retain = Boolean(hdr & 0x1);
    const qos = pkt.qos = (hdr>>1) & 0x3;

    const rdr = new mqtt_type_reader(u8_body, 0);
    pkt.topic = rdr.utf8();
    if (0 !== qos)
      pkt.pkt_id = rdr.u16();

    if (5 <= pkt.mqtt_level) {
      pkt.props = rdr.props();
      pkt.payload = rdr.flush();
    } else {
      pkt.payload = rdr.flush();
    }

    return pkt }
}

function mqtt_decode_puback(ns) {
  const _puback_reason_ = bind_reason_lookup([
    [ 0x00, 'Success'],

    // MQTT 5.0
    [ 0x10, 'No matching subscribers'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x90, 'Topic Name invalid'],
    [ 0x91, 'Packet identifier in use'],
    [ 0x97, 'Quota exceeded'],
    [ 0x99, 'Payload format invalid'],
  ]);


  return ns[0x4] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level) {
      pkt.reason = rdr.u8_reason(_puback_reason_);
      pkt.props = rdr.props();
    }

    return pkt }
}

function mqtt_decode_pubxxx(ns) {
  const _pubxxx_reason_ = bind_reason_lookup([
    [ 0x00, 'Success' ],
    [ 0x92, 'Packet Identifier not found' ],
  ]);

  return ns[0x5] = ns[0x6] = ns[0x7] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    pkt.reason = rdr.u8_reason(_pubxxx_reason_);
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();
    return pkt }
}

function mqtt_decode_subscribe(ns) {
  class _subscription_options_ extends Number {
    get qos() { return this & 0x3 }
    get retain() { return this & 0x4 !== 0 }
    get retain_handling() { return (this >> 2) & 0x3 }
  }

  return ns[0x8] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();

    const topic_list = pkt.topics = [];
    while (rdr.has_more())
      topic_list.push({
        topic: rdr.utf8(),
        opts: rdr.u8_flags(_subscription_options_) });

    return pkt }
}

function _mqtt_decode_suback(_ack_reason_) {
  return (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();

    const answers = pkt.answers = [];
    while (rdr.has_more())
      answers.push(
        rdr.u8_reason(_ack_reason_) );

    return pkt }
}

function mqtt_decode_suback(ns) {
  const _suback_reason_ = bind_reason_lookup([
    // MQTT 3.1.1
    [ 0x00, 'Granted QoS 0'],
    [ 0x01, 'Granted QoS 1'],
    [ 0x02, 'Granted QoS 2'],

    // MQTT 5.0
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
    [ 0x97, 'Quota exceeded'],
    [ 0x9E, 'Shared Subscriptions not supported'],
    [ 0xA1, 'Subscription Identifiers not supported'],
    [ 0xA2, 'Wildcard Subscriptions not supported'],
  ]);

  return ns[0x9] = _mqtt_decode_suback(_suback_reason_)
}

function mqtt_decode_unsubscribe(ns) {
  return ns[0xa] = (pkt, u8_body) => {
    const rdr = new mqtt_type_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();

    const topic_list = pkt.topics = [];
    while (rdr.has_more())
      topic_list.push(rdr.utf8());

    return pkt }
}

function mqtt_decode_unsuback(ns) {
  const _unsuback_reason_ = bind_reason_lookup([
    [ 0x00, 'Success'],
    [ 0x11, 'No subscription existed'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
  ]);

  return ns[0xb] = _mqtt_decode_suback(_unsuback_reason_)
}

function mqtt_decode_pingxxx(ns) {
  return ns[0xc] = ns[0xd] = pkt => pkt
}

function mqtt_decode_disconnect(ns) {
  const _disconnect_reason_ = bind_reason_lookup([
    // MQTT 5.0
    [ 0x00, 'Normal disconnection'],
    [ 0x04, 'Disconnect with Will Message'],
    [ 0x80, 'Unspecified error'],
    [ 0x81, 'Malformed Packet'],
    [ 0x82, 'Protocol Error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x89, 'Server busy'],
    [ 0x8B, 'Server shutting down'],
    [ 0x8D, 'Keep Alive timeout'],
    [ 0x8E, 'Session taken over'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x90, 'Topic Name invalid'],
    [ 0x93, 'Receive Maximum exceeded'],
    [ 0x94, 'Topic Alias invalid'],
    [ 0x95, 'Packet too large'],
    [ 0x96, 'Message rate too high'],
    [ 0x97, 'Quota exceeded'],
    [ 0x98, 'Administrative action'],
    [ 0x99, 'Payload format invalid'],
    [ 0x9A, 'Retain not supported'],
    [ 0x9B, 'QoS not supported'],
    [ 0x9C, 'Use another server'],
    [ 0x9D, 'Server moved'],
    [ 0x9E, 'Shared Subscriptions not supported'],
    [ 0x9F, 'Connection rate exceeded'],
    [ 0xA0, 'Maximum connect time'],
    [ 0xA1, 'Subscription Identifiers not supported'],
    [ 0xA2, 'Wildcard Subscriptions not supported'],
  ]);


  return ns[0xe] = (pkt, u8_body) => {
    if (5 <= pkt.mqtt_level) {
      const rdr = new mqtt_type_reader(u8_body, 0);
      pkt.reason = rdr.u8_reason(_disconnect_reason_);
      pkt.props = rdr.props();
    }
    return pkt }
}

function mqtt_decode_auth(ns) {
  const _auth_reason_ = bind_reason_lookup([
    // MQTT 5.0
    [ 0x00, 'Success' ],
    [ 0x18, 'Continue authentication' ],
    [ 0x19, 'Re-authenticate' ],
  ]);

  return ns[0xf] = (pkt, u8_body) => {
    if ( 5 <= pkt.mqtt_level ) {
      const rdr = new mqtt_type_reader(u8_body, 0);
      pkt.reason = rdr.u8_reason(_auth_reason_);
      pkt.props = rdr.props();
    }
    return pkt }
}

function mqtt_pkt_writer_pool() {
  const _pool_ = [];
  return host =>
    0 === _pool_.length
      ? mqtt_pkt_writer(host, _pool_)
      : _pool_.pop()(host)
}

function mqtt_pkt_writer(host, _pool_) {
  // avoid GCing push/pull when they can be reused
  let n=0, rope=[];
  return install(host)

  function install(_host) {
    host = _host;
    host.push = push;
    host.pack = pack;
  }

  function push(u8) {
    rope.push(u8);
    n += u8.length;
  }

  function pack(hdr) {
    host = host.push = host.pack = null;

    const res = _mqtt_pkt_rope(hdr, n, rope);
    n=0; rope=[];
    if (undefined !== _pool_)
      _pool_.push(install);

    return res
  }
}


function _mqtt_pkt_rope(hdr, n, rope) {
  const header = encode_varint(n, hdr);
  let i = header.length;

  const pkt = new Uint8Array(n + i);
  pkt.set(header, 0);
  for (const vec of rope) {
    pkt.set(vec, i);
    i += vec.length;
  }
  return pkt
}

const pack_utf8 = v => new TextEncoder('utf-8').encode(v);
const pack_u16 = v => [ (v>>>8) & 0xff, v & 0xff ];
const pack_u32 = v => [ (v>>>24) & 0xff, (v>>>16) & 0xff, (v>>>8) & 0xff, v & 0xff ];

class mqtt_type_writer {
  constructor() {
    this._pkt_writer(this);
  }

  as_pkt(hdr) { return this.pack([hdr]) }

  u8(v) { this.push([ v & 0xff ]);}
  u16(v) { this.push( pack_u16(v) );}
  u32(v) { this.push( pack_u32(v) );}
  vint(v) { this.push( encode_varint(v) );}

  _u16_bin(u8_buf) {
    const {push} = this;
    push( pack_u16( u8_buf.byteLength ));
    push( u8_buf );
  }

  flush(buf) {
    if (null != buf)
      this.push(
        'string' === typeof buf
          ? pack_utf8(buf) : buf );

    this.push = false;
  }

  bin(u8_buf) {
    if (! u8_buf) return this.u16(0)
    if ('string' === typeof u8_buf)
      return this.utf8(u8_buf)

    if (u8_buf.length !== u8_buf.byteLength)
      u8_buf = new Uint8Array(u8_buf);
    this._u16_bin(u8_buf);
  }

  utf8(v) { this._u16_bin( new TextEncoder('utf-8').encode(v) ); }

  pair(k,v) {
    this.utf8(k);
    this.utf8(v);
  }

  u8_flags(v, enc_flags, b0=0) {
    if (undefined !== v && isNaN(+v))
      v = enc_flags(v, 0);

    v |= b0;
    this.push([v]);
    return v
  }

  u8_reason(v) { this.push([v | 0]); }

  props(props) {
    if (! props)
      return this.u8(0)

    if (! Array.isArray(props))
      props = props.entries
        ? Array.from(props.entries())
        : Object.entries(props);

    const wrt = this._fork();
    for (const [name, value] of props) {
      const {id, type} = mqtt_props_by_id(name);
      wrt.u8(id);
      wrt[type](value);
    }

    this.push(wrt.pack([]));
  }
}

mqtt_type_writer.prototype._pkt_writer = 
  mqtt_pkt_writer_pool();

const _c_mqtt_proto = new Uint8Array([
  0, 4, 0x4d, 0x51, 0x54, 0x54 ]);

function mqtt_encode_connect(ns) {
  const _enc_flags_connect = flags => 0
      | ( flags.reserved ? 0x01 : 0 )
      | ( (flags.will_qos & 0x3) << 3 )
      | ( flags.clean_start ? 0x02 : 0 )
      | ( flags.will_flag ? 0x04 : 0 )
      | ( flags.will_retain ? 0x20 : 0 )
      | ( flags.password ? 0x40 : 0 )
      | ( flags.username ? 0x80 : 0 );

  const _enc_flags_will = will => 0x4
      | ( (will.qos & 0x3) << 3 )
      | ( will.retain ? 0x20 : 0 );

  return ns.connect = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer();

    wrt.push(_c_mqtt_proto);
    wrt.u8( mqtt_level );

    const {will} = pkt;
    const flags = wrt.u8_flags(
      pkt.flags,
      _enc_flags_connect,
      will ? _enc_flags_will(will) : 0 );

    wrt.u16(pkt.keep_alive);

    if (5 <= mqtt_level)
      wrt.props(pkt.props);


    wrt.utf8(pkt.client_id);
    if (flags & 0x04) { // .will_flag
      if (5 <= mqtt_level)
        wrt.props(will.properties);

      wrt.utf8(will.topic);
      wrt.bin(will.payload);
    }

    if (flags & 0x80) // .username
      wrt.utf8(pkt.username);

    if (flags & 0x40) // .password
      wrt.bin(pkt.password);

    return wrt.as_pkt(0x10)
  }
}

function mqtt_encode_connack(ns) {
  const _enc_flags_connack = flags =>
    flags.session_present ? 1 : 0;

  return ns.connack = (mqtt_level, pkt) => {
    const wrt = new mqtt_type_writer();
    wrt.u8_flags( pkt.flags, _enc_flags_connack );

    if (5 <= mqtt_level) {
      wrt.u8_reason( pkt.reason );
      wrt.props( pkt.props );

    } else {
      wrt.u8_reason( pkt.return_code || pkt.reason );
    }

    return wrt.as_pkt(0x20)
  }
}

function mqtt_encode_publish(ns) {
  return ns.publish = ( mqtt_level, pkt ) => {
    const qos = (pkt.qos & 0x3) << 1;
    const wrt = new mqtt_type_writer();

    wrt.utf8(pkt.topic);
    if (0 !== qos)
      wrt.u16(pkt.pkt_id);

    if ( 5 <= mqtt_level) {
      wrt.props(pkt.props);
      wrt.flush(pkt.payload);
    } else {
      wrt.flush(pkt.payload);
    }

    return wrt.as_pkt(
      0x30 | qos | (pkt.dup ? 0x8 : 0) | (pkt.retain ? 0x1 : 0) )
  }
}

function mqtt_encode_puback(ns) {
  return ns.puback = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer();

    wrt.u16(pkt.pkt_id);
    if (5 <= mqtt_level) {
      wrt.u8_reason(pkt.reason);
      wrt.props(pkt.props);
    }

    return wrt.as_pkt(0x40)
  }
}

function mqtt_encode_pubxxx(ns) {
  ns.pubrec = _enc_pubxxx(0x50);
  ns.pubrel = _enc_pubxxx(0x62);
  ns.pubcomp = _enc_pubxxx(0x70);


  function _enc_pubxxx(hdr) {
    return ( mqtt_level, pkt ) => {
      const wrt = new mqtt_type_writer();

      wrt.u16(pkt.pkt_id);
      if (5 <= mqtt_level) {
        wrt.props(pkt.props);
        wrt.u8_reason(pkt.reason);

      } else {
        wrt.u8_reason( pkt.return_code || pkt.reason );
      }

      return wrt.as_pkt(hdr)
    }
  }
}

function mqtt_encode_subscribe(ns) {
  const _enc_subscribe_flags = opts => 0
      | ( opts.qos & 0x3 )
      | ( opts.retain ? 0x4 : 0 )
      | ( (opts.retain_handling & 0x3) << 2 );

  return ns.subscribe = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer();

    wrt.u16(pkt.pkt_id);
    if (5 <= pkt.mqtt_level)
      wrt.props(pkt.props);

    const f0 = _enc_subscribe_flags(pkt);
    for (const each of pkt.topics) {
      if ('string' === typeof each) {
        wrt.utf8(each);
        wrt.u8(f0);
      }

      else if (Array.isArray(each)) {
        wrt.utf8(each[0]);
        if (undefined !== each[1])
          wrt.u8_flags(each[1], _enc_subscribe_flags);
        else wrt.u8(f0);

      } else {
        wrt.utf8(each.topic);
        if (undefined !== each.opts)
          wrt.u8_flags(each.opts, _enc_subscribe_flags);
        else wrt.u8(f0);
      }
    }

    return wrt.as_pkt(0x82)
  }
}

function mqtt_encode_xxsuback(ns) {
  ns.suback = _enc_xxsuback(0x90);
  ns.unsuback = _enc_xxsuback(0xb0);


  function _enc_xxsuback(hdr) {
    return ( mqtt_level, pkt ) => {
      const wrt = new mqtt_type_writer();

      wrt.u16(pkt.pkt_id);
      if (5 <= pkt.mqtt_level)
        wrt.props(pkt.props);

      for (const ans of pkt.answers)
        wrt.u8_reason(ans);

      return wrt.as_pkt(hdr)
    }
  }
}

function mqtt_encode_unsubscribe(ns) {
  return ns.unsubscribe = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer();

    wrt.u16(pkt.pkt_id);
    if (5 <= pkt.mqtt_level)
      wrt.props(pkt.props);

    for (const topic of pkt.topics)
      wrt.utf8(topic);

    return wrt.as_pkt(0xa2)
  }
}

function mqtt_encode_pingxxx(ns) {
  ns.pingreq  = () => new Uint8Array([ 0xc0, 0 ]);
  ns.pingresp = () => new Uint8Array([ 0xd0, 0 ]);
}

function mqtt_encode_disconnect(ns) {
  return ns.disconnect = ( mqtt_level, pkt ) => {
    const wrt = new mqtt_type_writer();

    if (5 <= mqtt_level) {
      wrt.u8_reason(pkt.reason);
      wrt.props(pkt.props);
    }

    return wrt.as_pkt(0xe0)
  }
}

function mqtt_encode_auth(ns) {
  return ns.auth = ( mqtt_level, pkt ) => {
    if (5 > mqtt_level)
      throw new Error('Auth packets are only available after MQTT 5.x')

    const wrt = new mqtt_type_writer();

    wrt.u8_reason(pkt.reason);
    wrt.props(pkt.props);

    return wrt.as_pkt(0xf0)
  }
}

const mqtt_decode_zero = ns => (ns[0] = pkt => pkt);


function _bind_mqtt_decode(lst_decode_ops) {
  const by_id = [];
  for (const op of lst_decode_ops) op(by_id);

  return _pkt_ctx_ => _mqtt_raw_pkt_dispatch(
    (b0, u8_body) => {
      const decode_pkt = by_id[b0>>>4] || by_id[0];
      if (undefined !== decode_pkt)
        return decode_pkt({__proto__: _pkt_ctx_, b0}, u8_body)
    })
}


function _bind_mqtt_encode(lst_encode_ops) {
  const by_type = {};
  for (const op of lst_encode_ops) op(by_type);

  return mqtt_level => {
    mqtt_level = +mqtt_level || mqtt_level.mqtt_level;
    return (type, pkt) =>
      by_type[type]( mqtt_level, pkt )
  }
}


const _pkt_types = ['reserved', 'connect', 'connack', 'publish', 'puback', 'pubrec', 'pubrel', 'pubcomp', 'subscribe', 'suback', 'unsubscribe', 'unsuback', 'pingreq', 'pingresp', 'disconnect', 'auth'];
function _bind_pkt_ctx(_pkt_ctx_={}, mqtt_level=4) {
  _pkt_ctx_ = {
    __proto__: _pkt_ctx_,
    mqtt_level,
    get hdr() { return this.b0 & 0xf },
    get id() { return this.b0 >>> 4 },
    get type() { return _pkt_types[this.b0 >>> 4] },
  };
  return _pkt_ctx_._base_ = _pkt_ctx_
}

function _bind_mqtt_session_ctx(sess_decode, sess_encode, _pkt_ctx_) {
  sess_decode = _bind_mqtt_decode(sess_decode);
  sess_encode = _bind_mqtt_encode(sess_encode);

  const _sess_ctx = mqtt_level =>
    () => {
      let x = _bind_pkt_ctx(_pkt_ctx_, mqtt_level);
      return [sess_decode(x), sess_encode(x)]
    };

  _sess_ctx.v4 = _sess_ctx(4);
  _sess_ctx.v5 = _sess_ctx(5);
  return _sess_ctx
}

function mqtt_session_ctx() {
  let {ctx} = mqtt_session_ctx;
  if ( undefined === ctx ) {
    mqtt_session_ctx.ctx = ctx =
      _bind_mqtt_session_ctx(
        [ // lst_decode_ops = [
          mqtt_decode_zero,
          mqtt_decode_connect,
          mqtt_decode_connack,
          mqtt_decode_publish,
          mqtt_decode_puback,
          mqtt_decode_pubxxx,
          mqtt_decode_subscribe,
          mqtt_decode_suback,
          mqtt_decode_unsubscribe,
          mqtt_decode_unsuback,
          mqtt_decode_pingxxx,
          mqtt_decode_disconnect,
          mqtt_decode_auth, ],
        [ // lst_encode_ops = [
          mqtt_encode_connect,
          mqtt_encode_connack,
          mqtt_encode_publish,
          mqtt_encode_puback,
          mqtt_encode_pubxxx,
          mqtt_encode_subscribe,
          mqtt_encode_xxsuback,
          mqtt_encode_unsubscribe,
          mqtt_encode_pingxxx,
          mqtt_encode_disconnect,
          mqtt_encode_auth, ]);
  }

  return ctx
}

function _mqtt_client_conn(client) {
  const q = []; // tiny version of deferred
  q.then = y => void q.push(y);
  q.notify = v => { for (const fn of q.splice(0,q.length)) fn(v); };

  const send0 = async (type, pkt) =>
    (await q)(type, pkt);

  client._send = send0;
  return {
    is_live: ()=> send0 !== client._send,
    reset() { client._send = send0; },

    set(mqtt_session, send_u8_pkt) {
      const [mqtt_decode, mqtt_encode] =
        mqtt_session();

      const on_mqtt_chunk = u8_buf =>
        client.on_mqtt(
          mqtt_decode(u8_buf),
          client);

      const send_pkt = async (type, pkt) =>
        send_u8_pkt(
          mqtt_encode(type, pkt) );


      client._send = send_pkt;
      q.notify(send_pkt);
      return on_mqtt_chunk
    }
  }
}

class MQTTBonesClient {
  constructor(on_mqtt) {
    this._conn_ = _mqtt_client_conn(this);
    if (on_mqtt) {
      this.on_mqtt = on_mqtt;
      this.on_mqtt([], this);
    }
  }

  auth(pkt) { return this._send('auth', pkt) }
  connect(pkt) { return this._send('connect', pkt) }
  disconnect(pkt) { return this._send('disconnect', pkt) }

  ping() { return this._send('pingreq') }

  subscribe(pkt) { return this._send('subscribe', pkt) }
  unsubscribe(pkt) { return this._send('unsubscribe', pkt) }

  puback(pkt) { return this._send('puback', pkt) }
  publish(pkt) { return this._send('publish', pkt) }

  // _send(type, pkt) -- provided by _conn_ and transport
  on_mqtt(/*pkt_list, self*/) {}

  static with(mqtt_session) {
    this.prototype.mqtt_session = mqtt_session;
    return this
  }
}

class MQTTBonesWebClient extends MQTTBonesClient {
  async with_websock(websock) {
    if (null == websock)
      websock = 'ws://127.0.0.1:9001';

    if ('string' === typeof websock)
      websock = new WebSocket(websock, ['mqtt']);

    const {readyState} = websock;
    websock.binaryType = 'arraybuffer';
    if (1 !== readyState) {
      if (0 !== readyState)
        throw new Error('Invalid WebSocket readyState')

      await new Promise( y =>
        websock.addEventListener('open', y, {once: true}));
    }


    const {_conn_} = this;
    const on_mqtt_chunk = _conn_.set(
      this.mqtt_session,
      u8_pkt => websock.send(u8_pkt));

    websock.addEventListener('close',
      ()=> {
        delete websock.onmessage;
        _conn_.reset();
      }, {once: true});

    websock.onmessage = evt =>
      on_mqtt_chunk(
        // convert from ArrayBuffer to u8
        new Uint8Array(evt.data) );

    return this
  }
}

class MQTTBonesWeb_v4 extends MQTTBonesWebClient {}
class MQTTBonesWeb_v5 extends MQTTBonesWebClient {}

const {v4, v5} = mqtt_session_ctx();
MQTTBonesWeb_v4.with(v4);
MQTTBonesWeb_v5.with(v5);

export default MQTTBonesWeb_v4;
export { MQTTBonesWeb_v4, MQTTBonesWeb_v5 };
//# sourceMappingURL=web.mjs.map
