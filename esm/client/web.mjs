function encode_varint(n, a=[]) {
  do {
    const ni = n & 0x7f;
    n >>>= 7;
    a.push(ni | (0===n ? 0 : 0x80)); }
  while (n > 0)
  return a}


function decode_varint(u8, vi=0, vi_tuple=[]) {
  // unrolled for a max of 4 chains
  let n = (u8[vi] & 0x7f) <<  0;
  if (0x80 & u8[vi++]) {
    n |= (u8[vi] & 0x7f) <<  7;
    if (0x80 & u8[vi++]) {
      n |= (u8[vi] & 0x7f) << 14;
      if (0x80 & u8[vi++]) {
        n |= (u8[vi] & 0x7f) << 21;} } }

  vi_tuple[0] = n;
  vi_tuple[1] = vi;
  return vi_tuple}

const [mqtt_props_by_id, mqtt_props_entries] = ((() => {
  const entries =[
    [0x01, 'u8',   'payload_format_indicator']
  , [0x02, 'u32',  'message_expiry_interval', ]
  , [0x03, 'utf8', 'content_type', ]
  , [0x08, 'utf8', 'response_topic', ]
  , [0x09, 'bin',  'correlation_data', ]
  , [0x0B, 'vint', 'subscription_identifier', ]
  , [0x11, 'u32',  'session_expiry_interval', ]
  , [0x12, 'utf8', 'assigned_client_identifier', ]
  , [0x13, 'u16',  'server_keep_alive', ]
  , [0x15, 'utf8', 'authentication_method', ]
  , [0x16, 'bin',  'authentication_data', ]
  , [0x17, 'u8',   'request_problem_information', ]
  , [0x18, 'u32',  'will_delay_interval', ]
  , [0x19, 'u8',   'request_response_information', ]
  , [0x1A, 'utf8', 'response_information', ]
  , [0x1C, 'utf8', 'server_reference', ]
  , [0x1F, 'utf8', 'reason_string', ]
  , [0x21, 'u16',  'receive_maximum', ]
  , [0x22, 'u16',  'topic_alias_maximum', ]
  , [0x23, 'u16',  'topic_alias', ]
  , [0x24, 'u8',   'maximum_qo_s', ]
  , [0x25, 'u8',   'retain_available', ]
  , [0x26, 'pair', 'user_properties', true]
  , [0x27, 'u32',  'maximum_packet_size', ]
  , [0x28, 'u8',   'wildcard_subscription_available', ]
  , [0x29, 'u8',   'subscription_identifiers_available', true]
  , [0x2A, 'u8',   'shared_subscription_available', ] ];


  const prop_map = new Map();
  for (const [id, type, name, plural] of entries) {
    const prop_obj = {id, type, name};
    if (plural) {prop_obj.plural = plural;}
    prop_map.set(prop_obj.id, prop_obj);
    prop_map.set(prop_obj.name, prop_obj);}

  return [
    prop_map.get.bind(prop_map)
  , Array.from(prop_map.values()) ] })());

const as_utf8 = u8 =>
  new TextDecoder('utf-8').decode(u8);

class mqtt_type_reader {
  constructor(buf, idx=0) {
    this.buf = buf;
    this.step = (width, r) =>(r = idx, idx += width, r); }

  has_more() {
    const {buf, step} = this;
    return buf.byteLength > step(0)}

  u8() {
    const {buf, step} = this;
    return buf[step(1)]}

  u16() {
    const {buf, step} = this;
    const i = step(2);
    return (buf[i]<<8) | buf[i+1]}

  u32() {
    const {buf, step} = this;
    const i = step(4);
    return (buf[i]<<24) | (buf[i+1]<<16) | (buf[i+2]<<8) | buf[i+3]}

  vint() {
    const {buf, step} = this;
    const [n, vi] = decode_varint(buf, step(0));
    step(vi);
    return n}

  bin() {
    const {buf, step} = this;
    const i = step(2);
    const len = (buf[i]<<8) | buf[i+1];
    const i0 = step(len);
    return buf.subarray(i0, i0+len)}

  utf8() {return as_utf8(this.bin())}
  pair() {return [
    as_utf8(this.bin())
  , as_utf8(this.bin())] }

  u8_flags(FlagsType) {
    const {buf, step} = this;
    return new FlagsType(buf[step(1)])}

  u8_reason(fn_reason) {
    const {buf, step} = this;
    return fn_reason(buf[step(1)]) }

  flush() {
    const {buf, step} = this;
    this.step = this.buf = null;
    return buf.subarray(step(0))}

  props() {
    const {buf, step} = this;

    const [len, vi] = decode_varint(buf, step(0));
    const end_part = vi + len;
    step(end_part);
    if (0 === len) {
      return null}

    const prop_entries =[];
    const rdr = mqtt_reader(
      buf.subarray(vi, end_part));

    while (rdr.has_more()) {
      const {name, type} = mqtt_props_by_id(rdr.u8());
      const value = rdr[type]();
      prop_entries.push([name, value]); }

    return prop_entries} }



class U8_Reason extends Number {
  constructor(u8, reason) {
    super(u8);
    this.reason = reason;} }

function bind_reason_lookup(reason_entries) {
  const reason_map = new Map();
  for (const [u8, reason] of reason_entries) {
    reason_map.set(u8, new U8_Reason(u8, reason)); }

  return reason_map.get.bind(reason_map)}

class _connect_flags_ extends Number {
  get reserved() {return this & 0x01 !== 0}
  get clean_start() {return this & 0x02 !== 0}
  get will_flag() {return this & 0x04 !== 0}
  get will_qos() {return (this >>> 3) & 0x3}
  get will_retain() {return this & 0x20 !== 0}
  get password() {return this & 0x40 !== 0}
  get username() {return this & 0x80 !== 0} }


function mqtt_decode_connect(pkt) {
  const rdr = new mqtt_type_reader(pkt.u8_body, 0);
  if ('MQTT' !== rdr.utf8()) {
    throw new Error('Invalid mqtt_connect packet') }

  pkt._base_.mqtt_level = pkt.mqtt_level = rdr.u8();

  const flags = pkt.connect_flags =
    rdr.u8_flags(_connect_flags_);

  pkt.keep_alive = rdr.u16();

  if (5 <= pkt.mqtt_level) {
    pkt.props = rdr.props();}



  pkt.client_id = rdr.utf8();
  if (flags.will_flag) {
    const will = pkt.will = {};
    if (5 <= pkt.mqtt_level) {
      will.properties = rdr.props();}

    will.topic = rdr.utf8();
    will.payload = rdr.bin();
    will.qos = flags.will_qos;
    will.retain = flags.will_retain;}

  if (flags.username) {
    pkt.username = rdr.utf8();}

  if (flags.password) {
    pkt.password = rdr.bin();}
  return pkt}

class _connack_flags_ extends Number {
  get session_present() {return this & 0x01 !== 0} }

const _connack_reason_ = bind_reason_lookup([
  // MQTT 3.1.1
  [0x00, 'Success']
, [0x01, 'Connection refused, unacceptable protocol version']
, [0x02, 'Connection refused, identifier rejected']
, [0x03, 'Connection refused, server unavailable']
, [0x04, 'Connection refused, bad user name or password']
, [0x05, 'Connection refused, not authorized']

, // MQTT 5.0
  [0x81, 'Malformed Packet']
, [0x82, 'Protocol Error']
, [0x83, 'Implementation specific error']
, [0x84, 'Unsupported Protocol Version']
, [0x85, 'Client Identifier not valid']
, [0x86, 'Bad User Name or Password']
, [0x87, 'Not authorized']
, [0x88, 'Server unavailable']
, [0x89, 'Server busy']
, [0x8A, 'Banned']
, [0x8C, 'Bad authentication method']
, [0x90, 'Topic Name invalid']
, [0x95, 'Packet too large']
, [0x97, 'Quota exceeded']
, [0x99, 'Payload format invalid']
, [0x9A, 'Retain not supported']
, [0x9B, 'QoS not supported']
, [0x9C, 'Use another server']
, [0x9D, 'Server moved']
, [0x9F, 'Connection rate exceeded'] ]);


function mqtt_decode_connack(pkt) {
  const rdr = new mqtt_type_reader(pkt.u8_body, 0);

  const flags = pkt.connect_flags =
    rdr.u8_flags(_connack_flags_);

  pkt.reason = rdr.u8_reason(_connack_reason_);
  if (5 <= pkt.mqtt_level) {
    pkt.props = rdr.props();}
  return pkt}

function mqtt_decode_publish(pkt) {
  const {hdr} = pkt;
  pkt.dup = Boolean(hdr & 0x8);
  pkt.retain = Boolean(hdr & 0x1);
  const qos = pkt.qos = (hdr>>1) & 0x3;

  const rdr = new mqtt_type_reader(pkt.u8_body, 0);
  pkt.topic = rdr.utf8();
  if (0 !== qos) {
    pkt.pkt_id = rdr.u16();}

  if (5 <= pkt.mqtt_level) {
    pkt.props = rdr.props();
    pkt.payload = rdr.flush();}
  else {
    pkt.payload = rdr.flush();}

  return pkt}

const _puback_reason_ = bind_reason_lookup([
  [0x00, 'Success']

, // MQTT 5.0
  [0x10, 'No matching subscribers']
, [0x80, 'Unspecified error']
, [0x83, 'Implementation specific error']
, [0x87, 'Not authorized']
, [0x90, 'Topic Name invalid']
, [0x91, 'Packet identifier in use']
, [0x97, 'Quota exceeded']
, [0x99, 'Payload format invalid'] ]);


function mqtt_decode_puback(pkt) {
  const rdr = new mqtt_type_reader(pkt.u8_body, 0);

  pkt.pkt_id = rdr.u16();
  if (5 <= pkt.mqtt_level) {
    pkt.reason = rdr.u8_reason(_puback_reason_);
    pkt.props = rdr.props();}

  return pkt}

const _pubxxx_reason_ = bind_reason_lookup([
  [0x00, 'Success']
, [0x92, 'Packet Identifier not found'] ]);


function _mqtt_decode_pubxxx(pkt) {
  const rdr = new mqtt_type_reader(pkt.u8_body, 0);

  pkt.pkt_id = rdr.u16();
  pkt.reason = rdr.u8_reason(_pubxxx_reason_);
  if (5 <= pkt.mqtt_level) {
    pkt.props = rdr.props();}
  return pkt}

class _subscription_options_ extends Number {
  get qos() {return this & 0x3}
  get retain() {return this & 0x4 !== 0}
  get retain_handling() {return (this >> 2) & 0x3} }

function mqtt_decode_subscribe(pkt) {
  const rdr = new mqtt_type_reader(pkt.u8_body, 0);

  pkt.pkt_id = rdr.u16();
  if (5 <= pkt.mqtt_level) {
    pkt.props = rdr.props();}

  const topic_list = pkt.topics = [];
  while (rdr.has_more()) {
    topic_list.push({
      topic: rdr.utf8()
    , opts: rdr.u8_flags(_subscription_options_)}); }

  return pkt}

function _mqtt_decode_suback(pkt, _ack_reason_) {
  const rdr = new mqtt_type_reader(pkt.u8_body, 0);

  pkt.pkt_id = rdr.u16();
  if (5 <= pkt.mqtt_level) {
    pkt.props = rdr.props();}

  const answers = pkt.answers = [];
  while (rdr.has_more()) {
    answers.push(
      rdr.u8_reason(_ack_reason_)); }

  return pkt}

const _suback_reason_ = bind_reason_lookup([
  // MQTT 3.1.1
  [0x00, 'Granted QoS 0']
, [0x01, 'Granted QoS 1']
, [0x02, 'Granted QoS 2']

, // MQTT 5.0
  [0x80, 'Unspecified error']
, [0x83, 'Implementation specific error']
, [0x87, 'Not authorized']
, [0x8F, 'Topic Filter invalid']
, [0x91, 'Packet Identifier in use']
, [0x97, 'Quota exceeded']
, [0x9E, 'Shared Subscriptions not supported']
, [0xA1, 'Subscription Identifiers not supported']
, [0xA2, 'Wildcard Subscriptions not supported'] ]);


function mqtt_decode_suback(pkt) {
  return _mqtt_decode_suback(
    pkt, _suback_reason_) }

function mqtt_decode_unsubscribe(pkt) {
  const rdr = new mqtt_type_reader(pkt.u8_body, 0);

  pkt.pkt_id = rdr.u16();
  if (5 <= pkt.mqtt_level) {
    pkt.props = rdr.props();}

  const topic_list = pkt.topics = [];
  while (rdr.has_more()) {
    topic_list.push(rdr.utf8()); }

  return pkt}

const _unsuback_reason_ = bind_reason_lookup([
  [0x00, 'Success']
, [0x11, 'No subscription existed']
, [0x80, 'Unspecified error']
, [0x83, 'Implementation specific error']
, [0x87, 'Not authorized']
, [0x8F, 'Topic Filter invalid']
, [0x91, 'Packet Identifier in use'] ]);

function mqtt_decode_unsuback(pkt) {
  return _mqtt_decode_suback(
    pkt, _unsuback_reason_) }

const _disconnect_reason_ = bind_reason_lookup([
  // MQTT 5.0
  [0x00, 'Normal disconnection']
, [0x04, 'Disconnect with Will Message']
, [0x80, 'Unspecified error']
, [0x81, 'Malformed Packet']
, [0x82, 'Protocol Error']
, [0x83, 'Implementation specific error']
, [0x87, 'Not authorized']
, [0x89, 'Server busy']
, [0x8B, 'Server shutting down']
, [0x8D, 'Keep Alive timeout']
, [0x8E, 'Session taken over']
, [0x8F, 'Topic Filter invalid']
, [0x90, 'Topic Name invalid']
, [0x93, 'Receive Maximum exceeded']
, [0x94, 'Topic Alias invalid']
, [0x95, 'Packet too large']
, [0x96, 'Message rate too high']
, [0x97, 'Quota exceeded']
, [0x98, 'Administrative action']
, [0x99, 'Payload format invalid']
, [0x9A, 'Retain not supported']
, [0x9B, 'QoS not supported']
, [0x9C, 'Use another server']
, [0x9D, 'Server moved']
, [0x9E, 'Shared Subscriptions not supported']
, [0x9F, 'Connection rate exceeded']
, [0xA0, 'Maximum connect time']
, [0xA1, 'Subscription Identifiers not supported']
, [0xA2, 'Wildcard Subscriptions not supported'] ]);


function mqtt_decode_disconnect(pkt) {
  if (5 <= pkt.mqtt_level) {
    const rdr = new mqtt_type_reader(pkt.u8_body, 0);
    pkt.reason = rdr.u8_reason(_disconnect_reason_);
    pkt.props = rdr.props();}
  return pkt}

const _auth_reason_ = bind_reason_lookup([
  // MQTT 5.0
  [0x00, 'Success']
, [0x18, 'Continue authentication']
, [0x19, 'Re-authenticate'] ]);

function mqtt_decode_auth(pkt) {
  if (5 <= pkt.mqtt_level) {
    const rdr = new mqtt_type_reader(pkt.u8_body, 0);
    pkt.reason = rdr.u8_reason(_auth_reason_);
    pkt.props = rdr.props();}
  return pkt}

function mqtt_dnu_decode(pkt) {
  const err = new Error('MQTT packet not understood');
  err.pkt = pkt;
  throw err}

const mqtt_decode_noop = pkt => pkt;


const mqtt_decode_ops_by_id =[
  mqtt_dnu_decode
, mqtt_decode_connect
, mqtt_decode_connack
, mqtt_decode_publish
, mqtt_decode_puback
, _mqtt_decode_pubxxx
, _mqtt_decode_pubxxx
, _mqtt_decode_pubxxx
, mqtt_decode_subscribe
, mqtt_decode_suback
, mqtt_decode_unsubscribe
, mqtt_decode_unsuback
, mqtt_decode_noop // mqtt_decode_pingreq
, mqtt_decode_noop // mqtt_decode_pingresp
, mqtt_decode_disconnect
, mqtt_decode_auth];

function mqtt_pkt_writer_pool() {
  const _pool_ = [];
  return (() =>0 === _pool_.length
      ? mqtt_pkt_writer(_pool_)
      : _pool_.pop()) }

function mqtt_pkt_writer(_pool_) {
  let self, n=0, rope=[];
  return self ={
    push(u8) {
      


      rope.push(u8);
      n += u8.length;}

  , as_pkt(hdr) {
      const pkt = _mqtt_pkt_rope(hdr, n, rope);
      n=0; rope=[];
      if (undefined !== _pool_) {
        _pool_.push(self);}
      return pkt} } }

function _mqtt_pkt_rope(hdr, n, rope) {
  const header = encode_varint(n, [hdr]);
  let i = header.length;

  const pkt = new Uint8Array(n + i);
  pkt.set(header, 0);
  for (const vec of rope) {
    pkt.set(vec, i);
    i += vec.length;}
  return pkt}

const pack_utf8 = v => new TextEncoder('utf-8').encode(v);
const pack_u16 = v =>[(v>>>8) & 0xff, v & 0xff];
const pack_u32 = v =>[(v>>>24) & 0xff, (v>>>16) & 0xff, (v>>>8) & 0xff, v & 0xff];

class mqtt_type_writer {
  constructor() {
    Object.assign(this, this._pkt_writer()); }

  u8(v) {this.push([v & 0xff]);}
  u16(v) {this.push(pack_u16(v));}
  u32(v) {this.push(pack_u32(v));}
  vint(v) {this.push(encode_varint(v));}

  _u16_bin(u8_buf) {
    const {push} = this;
    push(pack_u16(u8_buf.byteLength));
    push(u8_buf); }

  flush(buf) {
    this.push(
      'string' === typeof buf
        ? pack_utf8(buf) : buf);

    this.push = false;}

  bin(u8_buf) {
    if ('string' === typeof u8_buf) {
      return this.utf8(u8_buf)}

    if (u8_buf.length !== u8_buf.byteLength) {
      u8_buf = new Uint8Array(u8_buf);}
    this._u16_bin(u8_buf);}

  utf8(v) {this._u16_bin(
    new TextEncoder('utf-8').encode(v)); }

  pair(k,v) {
    this.utf8(k);
    this.utf8(v);}

  u8_flags(v, enc_flags, b0=0) {
    if (undefined !== v && isNaN(+v)) {
      v = enc_flags(v, 0);}

    v |= b0;
    this.push([v]);
    return v}

  u8_reason(v) {this.push([v | 0]);}

  props() {throw "TODO"} }

mqtt_type_writer.prototype._pkt_writer = 
  mqtt_pkt_writer_pool();

const _c_mqtt_proto = new Uint8Array([
  0, 4, 0x4d, 0x51, 0x54, 0x54]);

function mqtt_encode_connect(mqtt_level, pkt) {
  const wrt = new mqtt_type_writer();

  wrt.push(_c_mqtt_proto);
  wrt.u8(mqtt_level);

  const {will} = pkt;
  const flags = wrt.u8_flags(
    pkt.connect_flags
  , _enc_connect_flags
  , will ? _enc_will_flags(will) : 0);

  wrt.u16(pkt.keep_alive);

  if (5 <= mqtt_level) {
    wrt.props(pkt.props);}


  wrt.utf8(pkt.client_id);
  if (flags & 0x04) {// .will_flag
    if (5 <= mqtt_level) {
      wrt.props(will.properties); }

    wrt.utf8(will.topic);
    wrt.bin(will.payload); }

  if (flags & 0x80) {// .username
    wrt.utf8(pkt.username); }

  if (flags & 0x40) {// .password
    wrt.bin(pkt.password); }

  return wrt.as_pkt(0x10)}

const _enc_connect_flags = flags => 0
    |(flags.reserved ? 0x01 : 0)
    |((flags.will_qos & 0x3) << 3)
    |(flags.clean_start ? 0x02 : 0)
    |(flags.will_flag ? 0x04 : 0)
    |(flags.will_retain ? 0x20 : 0)
    |(flags.password ? 0x40 : 0)
    |(flags.username ? 0x80 : 0);

const _enc_will_flags = will => 0x4
    |((will.qos & 0x3) << 3)
    |(will.retain ? 0x20 : 0);

function mqtt_encode_connack(mqtt_level, pkt) {
  const wrt = new mqtt_type_writer();
  wrt.u8_flags(pkt.connect_flags, _enc_flags_connack);

  if (5 <= mqtt_level) {
    wrt.u8_reason(pkt.reason);
    wrt.props(pkt.props); }

  else {
    wrt.u8_reason(pkt.return_code || pkt.reason); }

  return wrt.as_pkt(0x20)}

const _enc_flags_connack = connect_flags =>
  connect_flags.session_present ? 1 : 0;

function mqtt_encode_publish(mqtt_level, pkt) {
  const qos = (pkt.qos & 0x3) << 1;
  const wrt = new mqtt_type_writer();

  wrt.utf8(pkt.topic);
  if (0 !== qos) {
    wrt.u16(pkt.pkt_id);}

  if (5 <= mqtt_level) {
    wrt.props(pkt.props);
    wrt.flush(pkt.payload);}
  else {
    wrt.flush(pkt.payload);}

  return wrt.as_pkt(
    0x30 | qos | (pkt.dup ? 0x8 : 0) | (pkt.retain ? 0x1 : 0)) }

function mqtt_encode_puback(mqtt_level, pkt) {
  const wrt = new mqtt_type_writer();

  wrt.u16(pkt.pkt_id);
  if (5 <= mqtt_level) {
    wrt.u8_reason(pkt.reason);
    wrt.props(pkt.props);}

  return wrt.as_pkt(0x40)}

function _mqtt_encode_pubxxx(hdr, mqtt_level, pkt) {
  const wrt = new mqtt_type_writer();

  wrt.u16(pkt.pkt_id);
  if (5 <= mqtt_level) {
    wrt.props(pkt.props);
    wrt.u8_reason(pkt.reason); }

  else {
    wrt.u8_reason(pkt.return_code || pkt.reason); }

  return wrt.as_pkt(hdr)}

function mqtt_encode_pubrec(mqtt_level, pkt) {
  return _mqtt_encode_pubxxx(0x50, mqtt_level, pkt) }

function mqtt_encode_pubrel(mqtt_level, pkt) {
  return _mqtt_encode_pubxxx(0x62, mqtt_level, pkt) }

function mqtt_encode_pubcomp(mqtt_level, pkt) {
  return _mqtt_encode_pubxxx(0x70, mqtt_level, pkt) }

function mqtt_encode_subscribe(mqtt_level, pkt) {
  const wrt = new mqtt_type_writer();

  wrt.u16(pkt.pkt_id);
  if (5 <= pkt.mqtt_level) {
    wrt.props(pkt.props);}

  const f0 = _enc_subscribe_flags(pkt);
  for (const each of pkt.topics) {
    if ('string' === typeof each) {
      wrt.utf8(each);
      wrt.u8(f0);}

    else if (Array.isArray(each)) {
      wrt.utf8(each[0]);
      if (undefined !== each[1]) {
        wrt.u8_flags(each[1], _enc_subscribe_flags);}
      else wrt.u8(f0);}

    else {
      wrt.utf8(each.topic);
      if (undefined !== each.opts) {
        wrt.u8_flags(each.opts, _enc_subscribe_flags);}
      else wrt.u8(f0);} }

  return wrt.as_pkt(0x82)}

const _enc_subscribe_flags = opts => 0
    |(opts.qos & 0x3)
    |(opts.retain ? 0x4 : 0)
    |((opts.retain_handling & 0x3) << 2  );

function _mqtt_encode_suback(hdr, mqtt_level, pkt, key_answers) {
  const wrt = new mqtt_type_writer();

  wrt.u16(pkt.pkt_id);
  if (5 <= pkt.mqtt_level) {
    wrt.props(pkt.props); }

  for (const ans of pkt[key_answers]) {
    wrt.u8_reason(ans);}

  return wrt.as_pkt(hdr)}

function mqtt_encode_suback(mqtt_level, pkt) {
  return _mqtt_encode_suback(
    0x90, mqtt_level, pkt) }

function mqtt_encode_unsubscribe(mqtt_level, pkt) {
  const wrt = new mqtt_type_writer();

  wrt.u16(pkt.pkt_id);
  if (5 <= pkt.mqtt_level) {
    wrt.props(pkt.props);}

  for (const topic of pkt.topics) {
    wrt.utf8(topic);}

  return wrt.as_pkt(0xa2)}

function mqtt_encode_unsuback(mqtt_level, pkt) {
  return _mqtt_encode_suback(
    0xb0, mqtt_level, pkt) }

const mqtt_encode_pingreq = (() =>
  new Uint8Array([0xc0, 0]) );

const mqtt_encode_pingresp = (() =>
  new Uint8Array([0xd0, 0]) );

function mqtt_encode_disconnect(mqtt_level, pkt) {
  const wrt = new mqtt_type_writer();

  if (5 <= mqtt_level) {
    wrt.u8_reason(pkt.reason);
    wrt.props(pkt.props); }

  return wrt.as_pkt(0xe0)}

function mqtt_encode_auth(mqtt_level, pkt) {
  if (5 > mqtt_level) {
    throw new Error('Auth packets are only available after MQTT 5.x') }

  const wrt = new mqtt_type_writer();

  wrt.u8_reason(pkt.reason);
  wrt.props(pkt.props);

  return wrt.as_pkt(0xf0)}

const mqtt_encode_by_type ={
  connect: mqtt_encode_connect
, connack: mqtt_encode_connack
, publish: mqtt_encode_publish
, puback: mqtt_encode_puback
, pubrec: mqtt_encode_pubrec
, pubrel: mqtt_encode_pubrel
, pubcomp: mqtt_encode_pubcomp
, subscribe: mqtt_encode_subscribe
, suback: mqtt_encode_suback
, unsubscribe: mqtt_encode_unsubscribe
, unsuback: mqtt_encode_unsuback
, pingreq: mqtt_encode_pingreq
, pingresp: mqtt_encode_pingresp
, disconnect: mqtt_encode_disconnect
, auth: mqtt_encode_auth};

const [mqtt_cmd_by_type, mqtt_type_entries] = ((() => {

  const entries =[
    [0x0, 'reserved']
  , [0x1, 'connect']
  , [0x2, 'connack']
  , [0x3, 'publish']
  , [0x4, 'puback']
  , [0x5, 'pubrec']
  , [0x6, 'pubrel']
  , [0x7, 'pubcomp']
  , [0x8, 'subscribe']
  , [0x9, 'suback']
  , [0xa, 'unsubscribe']
  , [0xb, 'unsuback']
  , [0xc, 'pingreq']
  , [0xd, 'pingresp']
  , [0xe, 'disconnect']
  , [0xf, 'auth'] ];

  const type_map = new Map();
  for (const [id, type] of entries) {
    const cmd = id << 4;
    type_map.set(cmd, {type, cmd, id});}

  return [
    type_map.get.bind(type_map)
  , Array.from(type_map.values()) ] })());

function _mqtt_raw_pkt_decode_v(u8_ref, _pkt_ctx_) {
  const [u8] = u8_ref;
  const [len_body, len_vh] = decode_varint(u8, 1);

  const len_pkt = len_body + len_vh;
  if (u8.byteLength >= len_pkt) {
    const b0 = u8[0], cmd = b0 & 0xf0;
    u8_ref[0] = u8.subarray(len_pkt);
    return {__proto__: _pkt_ctx_
    , b0, cmd, id: b0>>>4, hdr: b0 & 0x0f
    , type_obj: mqtt_cmd_by_type(cmd)
    , u8_body: 0 === len_body ? null
        : u8.subarray(len_vh, len_pkt)} } }


function _pkt_utf8(u8) {
  return as_utf8(u8 || this.payload) }

function _pkt_json(u8) {
  return JSON.parse(
    as_utf8(u8 || this.payload) ) }

function _mqtt_raw_pkt_dispatch(u8_pkt_dispatch) {
  return (( _pkt_ctx_={} ) => {
    const l = [new Uint8Array(0)]; // reuse array to prevent garbage collection churn on ephemeral ones
    _pkt_ctx_._base_ = _pkt_ctx_;
    _pkt_ctx_.utf8 = _pkt_utf8;
    _pkt_ctx_.json = _pkt_json;

    return (( u8_buf ) => {
      l[0] = 0 === l[0].byteLength
        ? u8_buf : _u8_join(l[0], u8_buf);

      const res = [];
      while (true) {
        const u8_pkt = _mqtt_raw_pkt_decode_v(l, _pkt_ctx_);
        if (undefined !== u8_pkt) {
          res.push(u8_pkt_dispatch(u8_pkt)); }
        else return res} }) }) }


function _u8_join(a, b) {
  const alen = a.byteLength;
  const r = new Uint8Array(alen + b.byteLength);
  r.set(a, 0);
  r.set(b, alen);
  return r}

const _mqtt_pkt_id_dispatch = disp_parser =>
  _mqtt_raw_pkt_dispatch (( pkt ) => {
    const fn_disp = disp_parser[pkt.type_obj.id];
    return undefined !== fn_disp
      ? fn_disp.call(disp_parser, pkt)
      : disp_parser[0](pkt)});


const _mqtt_bind_encode = enc_by_type =>
  (( mqtt_level ) => {
    mqtt_level = +mqtt_level || mqtt_level.mqtt_level;
    return (( type, pkt ) =>
      enc_by_type[type](mqtt_level, pkt) ) });


function _bind_mqtt_session(mqtt_level, mqtt_decode_session, mqtt_encode_session) {
  mqtt_level = mqtt_level || 4;
  return (( _pkt_ctx_={mqtt_level} ) =>[
    mqtt_decode_session(_pkt_ctx_)
  , mqtt_encode_session(_pkt_ctx_)] ) }

const mqtt_decode_session =
  _mqtt_pkt_id_dispatch(
    mqtt_decode_ops_by_id);

const mqtt_encode_session =
  _mqtt_bind_encode(
    mqtt_encode_by_type);

const mqtt_session_v4 =
  _bind_mqtt_session(4,
    mqtt_decode_session,
    mqtt_encode_session,);

const mqtt_session_v5 =
  _bind_mqtt_session(5,
    mqtt_decode_session,
    mqtt_encode_session,);

const _c_pub = 'publish';

class MQTTBaseClient {
  constructor(target) {
    this._conn_ = this._transport(this);
    this._disp_ = this._dispatch(this, target);}

  /* async _send(type, pkt) -- provided by _transport */
  /* _on_mqtt(pkt_list, self) -- provided by _dispatch */

  auth(pkt) {return this._disp_send('auth', pkt, 'auth')}
  connect(pkt) {return this._disp_send('connect', pkt, 'connack')}

  disconnect(pkt) {return this._send('disconnect', pkt)}
  publish(pkt) {
    return pkt.qos > 0 
      ? this._disp_send(_c_pub, pkt)
      : this._send(_c_pub, pkt)}

  post(topic, payload) {
    return this._send(_c_pub,
      {topic, payload, qos:0} ) }
  send(topic, payload) {
    return this._disp_send(_c_pub,
      {topic, payload, qos:1} ) }

  subscribe(pkt, ex) {
    pkt = _as_topics(pkt, ex);
    return this._disp_send('subscribe', pkt)}
  unsubscribe(pkt, ex) {
    pkt = _as_topics(pkt, ex);
    return this._disp_send('unsubscribe', pkt)}

  async _disp_send(type, pkt, key) {
    const res = this._disp_.future(key || pkt);
    await this._send(type, pkt);
    return res} }


function _as_topics(pkt, ex) {
  if ('string' === typeof pkt) {
    return {topics:[pkt], ... ex}}
  if (pkt[Symbol.iterator]) {
    return {topics:[... pkt], ... ex}}
  return ex ? {...pkt, ...ex} : pkt}

function _mqtt_client_transport(client) {
  const q = []; // tiny version of deferred
  q.then = y => void q.push(y);
  q.notify = v => {for (const fn of q.splice(0,q.length)) {fn(v);} };

  const send0 = (async ( type, pkt ) => {
    (await q)(type, pkt);});

  client._send = send0;
  return {
    is_live: (() =>send0 !== client._send)
  , reset() {client._send = send0;}

  , set(mqtt_session, send_u8_pkt) {
      const [mqtt_decode, mqtt_encode] =
        mqtt_session();

      const on_mqtt_chunk = u8_buf =>
        client._on_mqtt(
          mqtt_decode(u8_buf)
        , client);

      const send_pkt = (async ( type, pkt ) => {
        send_u8_pkt(
          mqtt_encode(type, pkt)); });


      client._send = send_pkt;
      q.notify(send_pkt);
      return on_mqtt_chunk} } }

function _mqtt_client_dispatch(client, target) {
  let use_router;
  if (null == target) {
    target ={__proto__: client};
    use_router = 'function' !== typeof target.mqtt_publish;}

  else if ('function' === typeof target) {
    target = {mqtt_publish: target};}

  else {
    use_router = true === target.mqtt_publish;}

  if (use_router) {
    target.mqtt_publish =
      client._topic_router(client);}

  const hashbelt = [new Map()];
  let _hb_key, _pkt_id=100;
  const _deferred_by_key = (...args) =>
    hashbelt[0].set(_hb_key, args);

  const _disp_ ={
    __proto__: _mqtt_client_cmdid_dispatch
  , target, hashbelt,

    future(pkt_or_key) {
      if ('string' === typeof pkt_or_key) {
        _hb_key = pkt_or_key;}
      else {
        _pkt_id = (_pkt_id + 1) & 0xffff;
        _hb_key = pkt_or_key.pkt_id = _pkt_id;}

      return new Promise(_deferred_by_key)} };

  client._on_mqtt = _disp_.on_mqtt;
  return _disp_}


const _mqtt_client_cmdid_dispatch ={
  get on_mqtt() {
    const {cmdids, rotate:{td,n} } = this;
    let ts = td + Date.now();
    return (( pkt_list, client ) => {
      for (const pkt of pkt_list) {
        cmdids[pkt.id](this, pkt, client); }

      if (Date.now() > ts) {
        this.rotate_belt(n);
        ts = td + Date.now();} }) }


, resolve(key, pkt) {
    for (const map of this.hashbelt) {
      const entry = map.get(key);
      if (undefined !== entry) {
        map.delete(key);
        entry[0](pkt);
        return true} }
    return false}

, rotate:{n: 3, td: 1000 }// 3 * 1s buckets
, rotate_belt(n) {
    const {hashbelt} = this;
    hashbelt.unshift(new Map());
    for (const old of hashbelt.splice(n)) {
      for (const entry of old.values()) {
        entry[1]('expired');} } }

, cmdids: ((() => {
    return [
      by_evt   // 0x0 reserved
    , by_evt   // 0x1 connect
    , by_type  // 0x2 connack
    , by_evt   // 0x3 publish
    , by_id    // 0x4 puback
    , by_id    // 0x5 pubrec
    , by_id    // 0x6 pubrel
    , by_id    // 0x7 pubcomp
    , by_evt   // 0x8 subscribe
    , by_id    // 0x9 suback
    , by_evt   // 0xa unsubscribe
    , by_id    // 0xb unsuback
    , by_evt   // 0xc pingreq
    , by_evt   // 0xd pingresp
    , by_evt   // 0xe disconnect
    , by_type  ]// 0xf auth


    function by_id(disp, pkt) {
      disp.resolve(pkt.pkt_id, pkt); }

    function by_type(disp, pkt, client) {
      disp.resolve(pkt.type_obj.type, pkt);
      by_evt(disp, pkt, client);}

    async function by_evt({target}, pkt, client) {
      const fn = target[`mqtt_${pkt.type_obj.type}`]
        || target.mqtt_pkt;

      if (undefined !== fn) {
        await fn.call(target, pkt, client);} } })()) };

function _rxp_parse (str, loose) {
	if (str instanceof RegExp) return { keys:false, pattern:str };
	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
	arr[0] || arr.shift();

	while (tmp = arr.shift()) {
		c = tmp[0];
		if (c === '*') {
			keys.push('wild');
			pattern += '/(.*)';
		} else if (c === ':') {
			o = tmp.indexOf('?', 1);
			ext = tmp.indexOf('.', 1);
			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
		} else {
			pattern += '/' + tmp;
		}
	}

	return {
		keys: keys,
		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
	};
}

// Use [regexparam][] for url-like topic parsing

function _mqtt_topic_router(client) {
  const lst=[], find=_iter_topic_routes.bind(null, lst);

  client.router ={
    find, invoke,
    add(route, tgt) {
      route = _rxp_parse(route);
      route.tgt = tgt;
      lst.push(route);
      return this} };

  return invoke


  function invoke(pkt) {
    for (const [fn, kw] of find(pkt.topic)) {
      return undefined !== kw
        ? fn(kw, pkt)
        : fn(pkt)} } }



function * _iter_topic_routes(route_list, topic) {
  for (const route of route_list) {
    const {keys, pattern, tgt} = route;

    const match = pattern.exec('/'+topic);
    if (null === match) {
      continue}

    if (false === keys) {
      const {groups} = match;
      if (groups) {
        const kw = {};
        for (let k in groups) {
          kw[k] = groups[k];}

        yield [tgt, kw];}

      else yield [tgt];}

    else if (0 !== keys.length) {
      const kw = {};
      for (let i=0; i<keys.length; i++) {
        kw[ keys[i] ] = match[1+i];}
      yield [tgt, kw];}

    else yield [tgt];} }

class MQTTClient extends MQTTBaseClient {}


Object.assign(MQTTClient.prototype,{
  _transport: _mqtt_client_transport
, _dispatch: _mqtt_client_dispatch
, _topic_router: _mqtt_topic_router} );

class MQTTWebClient extends MQTTClient {
  async with_websock(websock) {
    if (null == websock) {
      websock = 'ws://127.0.0.1:9001';}

    if ('string' === typeof websock) {
      websock = new WebSocket(websock, ['mqtt']);}

    const {readyState} = websock;
    websock.binaryType = 'arraybuffer';
    if (1 !== readyState) {
      if (0 !== readyState) {
        throw new Error('Invalid WebSocket readyState') }

      await new Promise(y =>
        websock.addEventListener('open', y, {once: true}) ); }


    const {_conn_} = this;
    const on_mqtt_chunk = _conn_.set(
      this.mqtt_session
    , u8_pkt => websock.send(u8_pkt) );

    websock.addEventListener('close',
      (() => {
        delete websock.onmessage;
        _conn_.reset();})

    , {once: true});

    websock.onmessage = evt =>
      on_mqtt_chunk(
        new Uint8Array(evt.data));

    return this} }

class web extends MQTTWebClient {
  get mqtt_session() {
    return mqtt_session_v4} }

export default web;
//# sourceMappingURL=web.mjs.map
