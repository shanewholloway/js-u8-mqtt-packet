function encode_varint(n, a=[]) {
  do {
    const ni = n & 0x7f;
    n >>>= 7;
    a.push( ni | (0===n ? 0 : 0x80) );
  } while (n > 0)
  return a
}


/*
export function decode_varint_loop(u8, i=0) {
  let i0 = i
  let shift = 0, n = (u8[i] & 0x7f)
  while ( 0x80 & u8[i++] )
    n |= (u8[i] & 0x7f) << (shift += 7)

  return [n, i, i0]
}
*/


function decode_varint(u8, i=0) {
  let i0 = i;
  // unrolled for a max of 4 chains
  let n = (u8[i] & 0x7f) <<  0;
  if ( 0x80 & u8[i++] ) {
    n |= (u8[i] & 0x7f) <<  7;
    if ( 0x80 & u8[i++] ) {
      n |= (u8[i] & 0x7f) << 14;
      if ( 0x80 & u8[i++] ) {
        n |= (u8[i] & 0x7f) << 21;
      }
    }
  }
  return [n, i, i0]
}

function _mqtt_raw_pkt_dispatch(decode_raw_pkt) {
  let u8 = new Uint8Array(0);
  return u8_buf => {
    u8 = 0 === u8.byteLength
      ? u8_buf : _u8_join(u8, u8_buf);

    const res = [];
    while (1) {
      const [len_body, len_vh] = decode_varint(u8, 1);
      const len_pkt = len_body + len_vh;

      if ( u8.byteLength < len_pkt )
        return res

      let b0 = u8[0];
      let u8_body = 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt);

      u8 = u8.subarray(len_pkt);

      const pkt = decode_raw_pkt(b0, u8_body);
      if (undefined !== pkt && null !== pkt)
        res.push( pkt );
    }
  }
}

function _u8_join(a, b) {
  const alen = a.byteLength;
  const r = new Uint8Array(alen + b.byteLength);
  r.set(a, 0);
  r.set(b, alen);
  return r
}

const _pkt_types = ['~', 'connect', 'connack', 'publish', 'puback', 'pubrec', 'pubrel', 'pubcomp', 'subscribe', 'suback', 'unsubscribe', 'unsuback', 'pingreq', 'pingresp', 'disconnect', 'auth'];

function mqtt_bind_session_ctx(opts) {
  let _pkt_ctx_ = Object.defineProperties(opts._pkt_ctx_ || {}, {
    hdr:  {get() { return this.b0 & 0xf }},
    id:   {get() { return this.b0 >>> 4 }},
    type: {get() { return _pkt_types[this.b0 >>> 4] }},
  });

  let op, _decode_by_id=[], _encode_by_type={};
  for (op of opts.encode_fns)
    op(_encode_by_type, opts.mqtt_writer);
  for (op of opts.decode_fns)
    op(_decode_by_id, opts.mqtt_reader);

  var sess_encode = ({mqtt_level}) => (type, pkt) =>
    _encode_by_type[type]( mqtt_level, pkt );

  var sess_decode = _pkt_ctx_ =>
    _mqtt_raw_pkt_dispatch(
      (b0, u8_body, fn_decode_pkt) => (
        fn_decode_pkt = _decode_by_id[b0>>>4] || _decode_by_id[0],
        fn_decode_pkt?.({__proto__: _pkt_ctx_, b0}, u8_body) ) );

  return mqtt_level => _base_ => (
    _base_ = _base_ || {__proto__: _pkt_ctx_, mqtt_level, get _base_() { return _base_ }},
    [ sess_decode(_base_), sess_encode(_base_), _base_ ])
}

const mqtt_props = new Map(); 

{
  let entries = [
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
    [ 0x24, 'u8',   'maximum_qos'],
    [ 0x25, 'u8',   'retain_available'],
    [ 0x26, 'pair', 'user_properties', true],
    [ 0x27, 'u32',  'maximum_packet_size'],
    [ 0x28, 'u8',   'wildcard_subscription_available'],
    [ 0x29, 'u8',   'subscription_identifiers_available', true],
    [ 0x2A, 'u8',   'shared_subscription_available'],
  ];

  for (let [id, type, name, plural] of entries) {
    let prop_obj = {id, type, name};
    if (plural) prop_obj.plural = plural;
    mqtt_props.set(prop_obj.id, prop_obj);
    mqtt_props.set(prop_obj.name, prop_obj);
  }
}

const as_utf8 = u8 =>
  new TextDecoder('utf-8').decode(u8);

const step_from = idx =>
  (width, r) => ( r = idx, idx += width, r );

class mqtt_type_reader_v4 {
  constructor(buf, idx=0) {
    this.buf = buf;
    this.step = step_from(idx);
  }

  static with_info(... info_fn_list) {
    let mqtt_reader = class extends this {};
    for (let fn_info of info_fn_list)
      fn_info(mqtt_reader);
    return mqtt_reader
  }

  static reasons(pkt_type, ...reason_entries) {
    let proto = this.prototype;
    proto._reasons_by = {... proto._reasons_by};

    let lut = (proto._reasons_by[pkt_type] ||= new Map());
    for (let [u8, reason] of reason_entries)
      lut.set( u8, reason );

    return this
  }


  has_more() {
    let {buf, step} = this;
    return buf.byteLength > step(0)
  }

  u8() {
    let {buf, step} = this;
    return buf[step(1)]
  }

  u16() {
    let {buf, step} = this;
    let i = step(2);
    return (buf[i]<<8) | buf[i+1]
  }

  u32() {
    let {buf, step} = this;
    let i = step(4);
    return (buf[i]<<24) | (buf[i+1]<<16) | (buf[i+2]<<8) | buf[i+3]
  }

  vint() {
    let {buf, step} = this;
    let [n, vi, vi0] = decode_varint(buf, step(0));
    step(vi - vi0);
    return n
  }

  bin() {
    let {buf, step} = this;
    let i = step(2);
    let len = (buf[i]<<8) | buf[i+1];
    let i0 = step(len);
    return buf.subarray(i0, i0+len)
  }

  utf8() { return as_utf8(this.bin()) }
  pair() { return [ as_utf8(this.bin()), as_utf8(this.bin()) ] }

  u8_flags(FlagsType) {
    let {buf, step} = this;
    return new FlagsType(buf[step(1)])
  }

  u8_reason(lut_key) {
    let {buf, step} = this;
    let v = buf[step(1)];
    if (null != v) {
      let r = this._reasons_by[lut_key]?.get(v);
      return new U8_Reason(v, r || lut_key)
    }
  }

  flush() {
    let {buf, step} = this;
    this.step = this.buf = null;
    return buf.subarray(step(0))
  }

}

class mqtt_type_reader_v5 extends mqtt_type_reader_v4 {

  props() {
    let sub = this.vbuf();
    return null === sub ? null
      : this._fork(sub, 0)._read_props([])
  }

  vbuf() {
    let {buf, step} = this;
    let [n, vi, vi0] = decode_varint(buf, step(0));
    step(n + vi - vi0);
    return 0 === n ? null
      : buf.subarray(vi, step(0))
  }

  _fork(buf, idx) {
    return { __proto__: this, buf, step: step_from(idx) }
  }

  _read_props(lst) {
    while (this.has_more()) {
      let k = this.u8();
      let p = mqtt_props.get( k );
      let v = this[p.type]();
      lst.push([p.name, v]);
    }
    return lst
  }
}


class U8_Reason extends Number {
  constructor(u8, reason) { super(u8); this.reason = reason; }
}

function mqtt_pkt_writer_pool() {
  let _pool_ = [];
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

    let res = _mqtt_pkt_rope(hdr, n, rope);
    n=0; rope=[];
    if (undefined !== _pool_)
      _pool_.push(install);

    return res
  }
}


function _mqtt_pkt_rope(hdr, n, rope) {
  let header = encode_varint(n, hdr);
  let i = header.length;

  let pkt = new Uint8Array(n + i);
  pkt.set(header, 0);
  for (let vec of rope) {
    pkt.set(vec, i);
    i += vec.length;
  }
  return pkt
}

class mqtt_type_writer_v4 {
  constructor() {
    this._pkt_writer(this);
  }

  static init() {
    let mqtt_writer = class extends this {};
    mqtt_writer.prototype._pkt_writer =
      mqtt_pkt_writer_pool();
    return mqtt_writer
  }

  as_pkt(hdr) { return this.pack([hdr]) }

  u8(v) { this.push([ v & 0xff ]); }
  u16(v) { this.push([ (v>>>8) & 0xff, v & 0xff ]); }
  u32(v) { this.push([ (v>>>24) & 0xff, (v>>>16) & 0xff, (v>>>8) & 0xff, v & 0xff ]); }
  vint(v) { this.push( encode_varint(v) );}

  _u16_bin(u8_buf) {
    this.u16(u8_buf.byteLength);
    this.push(u8_buf);
  }

  flush(buf) {
    if (null != buf)
      this.push(
        'string' === typeof buf
          ? new TextEncoder('utf-8').encode(buf)
          : buf );

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

}


class mqtt_type_writer_v5 extends mqtt_type_writer_v4 {
  props(props) {
    if (! props)
      return this.u8(0)

    if (! Array.isArray(props))
      props = props.entries
        ? Array.from(props.entries())
        : Object.entries(props);

    if (0 === props.length)
      return this.u8(0)

    let wrt = this._fork();
    for (let [name, value] of props) {
      let {id, type} = mqtt_props.get(name);
      wrt.u8(id);
      wrt[type](value);
    }

    this.push(wrt.pack([]));
  }

  _fork() {
    let self = { __proto__: this };
    this._pkt_writer(self);
    return self
  }
}

function mqtt_decode_connect(ns, mqtt_reader) {
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
    let rdr = new mqtt_reader(u8_body, 0);
    if ('MQTT' !== rdr.utf8())
      throw new Error('Invalid mqtt_connect packet')

    pkt._base_.mqtt_level = pkt.mqtt_level = rdr.u8();

    let flags = pkt.flags =
      rdr.u8_flags(_connect_flags_);

    pkt.keep_alive = rdr.u16();

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();



    pkt.client_id = rdr.utf8();
    if (flags.will_flag) {
      let will = pkt.will = {};
      if (5 <= pkt.mqtt_level)
        will.props = rdr.props();

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

function mqtt_decode_connack(ns, mqtt_reader) {
  class _connack_flags_ extends Number {
    get session_present() { return this & 0x01 !== 0 }
  }

  return ns[0x2] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0);

    pkt.flags =
      rdr.u8_flags(_connack_flags_);

    pkt.reason = rdr.u8_reason(pkt.type);
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();
    return pkt }
}


function _connack_v4(mqtt_reader) {
  mqtt_reader.reasons('connack',
    // MQTT 3.1.1
    [ 0x00, 'Success'],
    [ 0x01, 'Connection refused, unacceptable protocol version'],
    [ 0x02, 'Connection refused, identifier rejected'],
    [ 0x03, 'Connection refused, server unavailable'],
    [ 0x04, 'Connection refused, bad user name or password'],
    [ 0x05, 'Connection refused, not authorized'],
  );
}

function mqtt_decode_publish(ns, mqtt_reader) {
  return ns[0x3] = (pkt, u8_body) => {
    let {hdr} = pkt;
    pkt.dup = Boolean(hdr & 0x8);
    pkt.retain = Boolean(hdr & 0x1);
    let qos = pkt.qos = (hdr>>1) & 0x3;

    let rdr = new mqtt_reader(u8_body, 0);
    pkt.topic = rdr.utf8();
    if (0 !== qos)
      pkt.pkt_id = rdr.u16();

    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();

    pkt.payload = rdr.flush();
    return pkt }
}

function mqtt_decode_puback(ns, mqtt_reader) {
  return ns[0x4] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level) {
      pkt.reason = rdr.u8_reason(pkt.type);
      pkt.props = rdr.props();
    }

    return pkt }
}


function _puback_v5(mqtt_reader) {
  mqtt_reader.reasons('puback',
    // MQTT 5.0
    [ 0x00, 'Success'],
    [ 0x10, 'No matching subscribers'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x90, 'Topic Name invalid'],
    [ 0x91, 'Packet identifier in use'],
    [ 0x97, 'Quota exceeded'],
    [ 0x99, 'Payload format invalid'],
  );
}

function mqtt_decode_pubxxx(ns, mqtt_reader) {
  return ns[0x5] = ns[0x6] = ns[0x7] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    pkt.reason = rdr.u8_reason('pubxxx', mqtt_reader);
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();
    return pkt }
}

function _pubxxx_v4(mqtt_reader) {
  mqtt_reader.reasons('pubxxx',
    // MQTT 3.1.1
    [ 0x00, 'Success' ],
    [ 0x92, 'Packet Identifier not found' ],
  );
}

function mqtt_decode_subscribe(ns, mqtt_reader) {
  class _subscription_options_ extends Number {
    get qos() { return this & 0x3 }
    get retain() { return this & 0x4 !== 0 }
    get retain_handling() { return (this >> 2) & 0x3 }
  }

  return ns[0x8] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();

    let topic_list = pkt.topics = [];
    while (rdr.has_more()) {
      let topic = rdr.utf8();
      let opts = rdr.u8_flags(_subscription_options_);
      topic_list.push({topic, opts});
    }

    return pkt }
}

function _mqtt_decode_suback(mqtt_reader) {
  return (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();

    let answers = pkt.answers = [];
    while (rdr.has_more())
      answers.push(
        rdr.u8_reason(pkt.type) );

    return pkt }
}

function mqtt_decode_suback(ns, mqtt_reader) {
  return ns[0x9] = _mqtt_decode_suback(mqtt_reader)
}

function _suback_v4(mqtt_reader) {
  mqtt_reader.reasons('suback',
    // MQTT 3.1.1
    [ 0x00, 'Granted QoS 0'],
    [ 0x01, 'Granted QoS 1'],
    [ 0x02, 'Granted QoS 2'],
  );
}

function _suback_v5(mqtt_reader) {
  _suback_v4(mqtt_reader);

  mqtt_reader.reasons('suback',
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
  );
}

function mqtt_decode_unsubscribe(ns, mqtt_reader) {
  return ns[0xa] = (pkt, u8_body) => {
    let rdr = new mqtt_reader(u8_body, 0);

    pkt.pkt_id = rdr.u16();
    if (5 <= pkt.mqtt_level)
      pkt.props = rdr.props();

    let topic_list = pkt.topics = [];
    while (rdr.has_more())
      topic_list.push(rdr.utf8());

    return pkt }
}

function mqtt_decode_unsuback(ns, mqtt_reader) {
  return ns[0xb] = _mqtt_decode_suback(mqtt_reader)
}

function _unsuback_v4(mqtt_reader) {
  mqtt_reader.reasons('unsuback',
    // MQTT 3.1.1
    [ 0x00, 'Success'],
    [ 0x11, 'No subscription existed'],
    [ 0x80, 'Unspecified error'],
    [ 0x83, 'Implementation specific error'],
    [ 0x87, 'Not authorized'],
    [ 0x8F, 'Topic Filter invalid'],
    [ 0x91, 'Packet Identifier in use'],
  );
}

function mqtt_decode_pingxxx(ns) {
  return ns[0xc] = ns[0xd] = pkt => pkt
}

function mqtt_decode_disconnect(ns, mqtt_reader) {
  return ns[0xe] = (pkt, u8_body) => {
    if (u8_body && 5 <= pkt.mqtt_level) {
      let rdr = new mqtt_reader(u8_body, 0);
      pkt.reason = rdr.u8_reason(pkt.type);
      pkt.props = rdr.props();
    }
    return pkt }
}


function _disconnect_v5(mqtt_reader) {
  mqtt_reader.reasons('disconnect',
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
  );
}

function mqtt_decode_auth(ns, mqtt_reader) {
  return ns[0xf] = (pkt, u8_body) => {
    if ( 5 <= pkt.mqtt_level ) {
      let rdr = new mqtt_reader(u8_body, 0);
      pkt.reason = rdr.u8_reason(pkt.type);
      pkt.props = rdr.props();
    }
    return pkt }
}


function _auth_v5(mqtt_reader) {
  mqtt_reader.reasons('auth',
    // MQTT 5.0
    [ 0x00, 'Success' ],
    [ 0x18, 'Continue authentication' ],
    [ 0x19, 'Re-authenticate' ],
  );
}

const _c_mqtt_proto = new Uint8Array([
  0, 4, 0x4d, 0x51, 0x54, 0x54 ]);

function mqtt_encode_connect(ns, mqtt_writer) {
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
    let wrt = new mqtt_writer();

    wrt.push(_c_mqtt_proto);
    wrt.u8( mqtt_level );

    let {will, username, password} = pkt;
    let flags = wrt.u8_flags(
      pkt.flags,
      _enc_flags_connect,
      0 | (username ? 0x80 : 0)
        | (password ? 0x40 : 0)
        | (will ? _enc_flags_will(will) : 0) );

    wrt.u16(pkt.keep_alive);

    if (5 <= mqtt_level)
      wrt.props(pkt.props);


    wrt.utf8(pkt.client_id);
    if (flags & 0x04) { // .will_flag
      if (5 <= mqtt_level)
        wrt.props(will.props);

      wrt.utf8(will.topic);
      wrt.bin(will.payload);
    }

    if (flags & 0x80) // .username
      wrt.utf8(username);

    if (flags & 0x40) // .password
      wrt.bin(password);

    return wrt.as_pkt(0x10)
  }
}

function mqtt_encode_connack(ns, mqtt_writer) {
  const _enc_flags_connack = flags =>
    flags.session_present ? 1 : 0;

  return ns.connack = (mqtt_level, pkt) => {
    let wrt = new mqtt_writer();
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

function mqtt_encode_publish(ns, mqtt_writer) {
  return ns.publish = ( mqtt_level, pkt ) => {
    let qos = (pkt.qos & 0x3) << 1;
    let wrt = new mqtt_writer();

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

function mqtt_encode_puback(ns, mqtt_writer) {
  return ns.puback = ( mqtt_level, pkt ) => {
    let wrt = new mqtt_writer();

    wrt.u16(pkt.pkt_id);
    if (5 <= mqtt_level) {
      wrt.u8_reason(pkt.reason);
      wrt.props(pkt.props);
    }

    return wrt.as_pkt(0x40)
  }
}

function mqtt_encode_pubxxx(ns, mqtt_writer) {
  ns.pubrec = _enc_pubxxx(0x50);
  ns.pubrel = _enc_pubxxx(0x62);
  ns.pubcomp = _enc_pubxxx(0x70);


  function _enc_pubxxx(hdr) {
    return ( mqtt_level, pkt ) => {
      let wrt = new mqtt_writer();

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

function mqtt_encode_subscribe(ns, mqtt_writer) {
  const _enc_subscribe_flags = opts => 0
      | ( opts.qos & 0x3 )
      | ( opts.retain ? 0x4 : 0 )
      | ( (opts.retain_handling & 0x3) << 2 );

  return ns.subscribe = ( mqtt_level, pkt ) => {
    let wrt = new mqtt_writer();

    wrt.u16(pkt.pkt_id);
    if (5 <= mqtt_level)
      wrt.props(pkt.props);

    let f0 = _enc_subscribe_flags(pkt);
    for (let each of pkt.topics) {
      if ('string' === typeof each) {
        wrt.utf8(each);
        wrt.u8(f0);
      } else {
        let [topic, opts] =
          Array.isArray(each) ? each
            : [each.topic, each.opts];

        wrt.utf8(topic);
        if (undefined === opts) wrt.u8(f0);
        else wrt.u8_flags(opts, _enc_subscribe_flags);
      }
    }

    return wrt.as_pkt(0x82)
  }
}

function mqtt_encode_xxsuback(ns, mqtt_writer) {
  ns.suback = _enc_xxsuback(0x90);
  ns.unsuback = _enc_xxsuback(0xb0);


  function _enc_xxsuback(hdr) {
    return ( mqtt_level, pkt ) => {
      let wrt = new mqtt_writer();

      wrt.u16(pkt.pkt_id);
      if (5 <= mqtt_level)
        wrt.props(pkt.props);

      for (let ans of pkt.answers)
        wrt.u8_reason(ans);

      return wrt.as_pkt(hdr)
    }
  }
}

function mqtt_encode_unsubscribe(ns, mqtt_writer) {
  return ns.unsubscribe = ( mqtt_level, pkt ) => {
    let wrt = new mqtt_writer();

    wrt.u16(pkt.pkt_id);
    if (5 <= mqtt_level)
      wrt.props(pkt.props);

    for (let topic of pkt.topics)
      wrt.utf8(topic);

    return wrt.as_pkt(0xa2)
  }
}

function mqtt_encode_pingxxx(ns, mqtt_writer) {
  ns.pingreq  = () => new Uint8Array([ 0xc0, 0 ]);
  ns.pingresp = () => new Uint8Array([ 0xd0, 0 ]);
}

function mqtt_encode_disconnect(ns, mqtt_writer) {
  return ns.disconnect = ( mqtt_level, pkt ) => {
    let wrt = new mqtt_writer();

    if (pkt && 5 <= mqtt_level) {
      if (pkt.reason || pkt.props) {
        wrt.u8_reason(pkt.reason);
        wrt.props(pkt.props);
      }
    }

    return wrt.as_pkt(0xe0)
  }
}

function mqtt_encode_auth(ns, mqtt_writer) {
  return ns.auth = ( mqtt_level, pkt ) => {
    if (5 > mqtt_level)
      throw new Error('Auth packets are only available after MQTT 5.x')

    let wrt = new mqtt_writer();

    wrt.u8_reason(pkt.reason);
    wrt.props(pkt.props);

    return wrt.as_pkt(0xf0)
  }
}

const mqtt_reader_v5 = /* #__PURE__ */
  mqtt_type_reader_v5.with_info(
    _connack_v4,
    _puback_v5,
    _pubxxx_v4,
    _suback_v5,
    _unsuback_v4,
    _disconnect_v5,
    _auth_v5,
  );

const mqtt_writer_v5 = /* #__PURE__ */
  mqtt_type_writer_v5.init();


const mqtt_decode_v5 =  [
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
  mqtt_decode_auth,
];


const mqtt_encode_v5 =  [
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
  mqtt_encode_auth,
];

function mqtt_session_ctx(mqtt_level) {
  let {ctx} = mqtt_session_ctx;
  if ( undefined === ctx ) {
    mqtt_session_ctx.ctx = ctx =
      mqtt_bind_session_ctx({
        // mqtt level 5 decoders can also decode level 4 (MQTT version 3.1.1)

        decode_fns: mqtt_decode_v5,
        mqtt_reader: mqtt_reader_v5,

        encode_fns: mqtt_encode_v5,
        mqtt_writer: mqtt_writer_v5,
      });
  }

  return ctx(mqtt_level)
}

function _mqtt_client_conn(client) {
  const q0 = _tiny_deferred_queue();
  const q = _tiny_deferred_queue();

  const _asy_send = async (type, pkt) =>
    (await q)(type, pkt);
  let _send = client._send = _asy_send;

  return {
    is_live: ()=> _asy_send !== _send,
    reset() { client._send = _send = _asy_send; },

    async send_connect(... args) {
      if (_asy_send === _send)
        _send = await q0;

      let res = _send(...args);

      // microtask break between connect and following packets
      await null;

      client._send = _send;
      q.notify(_send);
      return res
    },

    set(mqtt_session, send_u8_pkt) {
      const [mqtt_decode, mqtt_encode] = mqtt_session;

      const on_mqtt_chunk = u8_buf =>
        client.on_mqtt(
          mqtt_decode(u8_buf),
          {mqtt: client});

      _send = async (type, pkt) =>
        send_u8_pkt(
          mqtt_encode(type, pkt) );


      q0.notify(_send);
      _async_evt(client, client.on_live);

      return on_mqtt_chunk
    }
  }
}

async function _async_evt(obj, evt) {
  // microtask break
  if (undefined !== evt)
    await evt.call(obj, await obj);
}
function _tiny_deferred_queue() {
  const q = []; // tiny resetting deferred queue
  q.then = y => { q.push(y); };
  q.notify = v => { for (const fn of q.splice(0,q.length)) fn(v); };
  return q
}

class MQTTBonesClient {
  constructor(opt={}) {
    if ('function' === typeof opt)
      opt = {on_mqtt: opt};

    const {on_mqtt, on_live} = opt;
    if (on_mqtt)
      this.on_mqtt = on_mqtt;
    if (on_live)
      this.on_live = on_live;

    this._conn_ = _mqtt_client_conn(this);
    this.on_mqtt([], {mqtt:this});
  }

  auth(pkt) { return this._send('auth', pkt) }
  connect(pkt) { return this._conn_.send_connect('connect', pkt) }
  disconnect(pkt) { return this._send('disconnect', pkt) }

  ping() { return this._send('pingreq') }

  subscribe(pkt) { return this._send('subscribe', pkt) }
  unsubscribe(pkt) { return this._send('unsubscribe', pkt) }

  puback(pkt) { return this._send('puback', pkt) }
  publish(pkt) { return this._send('publish', pkt) }

  // _send(type, pkt) -- provided by _conn_ and transport
  on_mqtt(/*pkt_list, ctx*/) {}
  on_live(/*client*/) {}

  with_async_iter(async_iter, write_u8_pkt) {
    const {_conn_} = this;
    const on_mqtt_chunk = _conn_.set(
      this._mqtt_session(),
      write_u8_pkt);

    this._msg_loop = (async ()=>{
        async_iter = await async_iter;
        for await (let chunk of async_iter)
          on_mqtt_chunk(chunk);
        this._conn_.reset();
      })();

    return this
  }

  static with(mqtt_session) {
    this.prototype._mqtt_session = mqtt_session;
    return this
  }
}

class MQTTBonesWebClient extends MQTTBonesClient {
  with_websock(websock) {
    if (null == websock)
      websock = 'ws://127.0.0.1:9001';

    if ('string' === typeof websock || websock.origin)
      websock = new WebSocket(new URL(websock), ['mqtt']);

    websock.binaryType = 'arraybuffer';

    let ready = true, {readyState} = websock;
    if (1 !== readyState) {
      if (0 !== readyState)
        throw new Error('Invalid WebSocket readyState')

      ready = new Promise( y =>
        websock.addEventListener('open', y, {once: true}));
    }


    const {_conn_} = this;
    const on_mqtt_chunk = _conn_.set(
      this._mqtt_session(),
      async u8_pkt => (
        await ready,
        websock.send(u8_pkt)) );

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

class MQTTBonesWeb_v4 extends MQTTBonesWebClient {
  _mqtt_session() { return mqtt_session_ctx(4)() }
}

class MQTTBonesWeb_v5 extends MQTTBonesWebClient {
  _mqtt_session() { return mqtt_session_ctx(5)() }
}

export { MQTTBonesWeb_v4, MQTTBonesWeb_v5, MQTTBonesWeb_v4 as default };
//# sourceMappingURL=web.mjs.map
