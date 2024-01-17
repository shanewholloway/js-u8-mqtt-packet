import { hex_to_u8, u8_to_utf8 } from 'u8-utils'
import { mqtt_opts_v5, mqtt_pkt_ctx } from 'u8-mqtt-packet'
const mqtt_ctx_v5 = mqtt_pkt_ctx(5, mqtt_opts_v5)

const { assert, expect } = require('chai')

function _decode_one_hex(hex_pkt) {
  const mqtt_ctx = mqtt_ctx_v5.mqtt_stream()
  const [pkt0, pkt1] = mqtt_ctx.decode(hex_to_u8(hex_pkt))
  expect(pkt1).to.be.undefined
  return pkt0
}

describe('mqtt v5: small pub/sub capture', () => {
  it('pingreq', () => {
    const { type, ...tip } = _decode_one_hex('c000')

    expect(type).to.equal('pingreq')

    expect(tip)
    .to.deep.equal({ b0: 0xc0 })
  })

  it('pingresp', () => {
    const { type, ...tip } = _decode_one_hex('d000')

    expect(type).to.equal('pingresp')

    expect(tip)
    .to.deep.equal({ b0: 0xd0})
  })

  it('disconnect', () => {
    const { type, ...tip } = _decode_one_hex('e000')

    expect(type).to.equal('disconnect')

    expect(tip)
    .to.deep.equal({b0: 0xe0})
  })

  it('disconnect with reason', () => {
    const { type, reason, ...tip } = _decode_one_hex('e00104')

    expect(type).to.equal('disconnect')

    expect(4 == reason).to.be.true
    expect(+reason).to.equal(4)
    expect(reason.reason).to.equal('Disconnect with Will Message')

    expect(tip)
    .to.deep.equal({
      b0: 0xe0,
      props: null})
  })

  it('connack', () => {
    const { type, reason, flags, ...tip } =
      _decode_one_hex('202d00002a22000a12002435373846413945372d433438322d394444312d384632332d433838413042383245343046')

    expect(type).to.equal('connack')

    expect(tip)
    .to.deep.equal({
      b0: 0x20,
      props: {
        topic_alias_maximum: 10,
        assigned_client_identifier: '578FA9E7-C482-9DD1-8F23-C88A0B82E40F',
      }})

    expect(+flags).to.equal(0)
    expect(0 == flags).to.be.true

    expect(0 == reason).to.be.true
    expect(+reason).to.equal(0)
    expect(reason.reason).to.equal('Success')
  })

  it('connack with ident (mosquitto)', () => {
    const { type, reason, flags, ...tip } =
      _decode_one_hex('200600000322000a')

    expect(type).to.equal('connack')

    expect(tip)
    .to.deep.equal({
      b0: 0x20,
      props: {
        topic_alias_maximum: 10,
      }})

    expect(+flags).to.equal(0)
    expect(0 == flags).to.be.true

    expect(0 == reason).to.be.true
    expect(+reason).to.equal(0)
    expect(reason.reason).to.equal('Success')
  })

  it('connack with ident (ejabberd)', () => {
    const { type, reason, flags, ...tip } =
      _decode_one_hex('201000000d2200642a00110000000013003c')

    expect(type).to.equal('connack')

    expect(tip)
    .to.deep.equal({
      b0: 0x20,
      props: {
        topic_alias_maximum: 100,
        shared_subscription_available: 0,
        session_expiry_interval: 0,
        server_keep_alive: 60,
      }})

    expect(+flags).to.equal(0)
    expect(0 == flags).to.be.true

    expect(0 == reason).to.be.true
    expect(+reason).to.equal(0)
    expect(reason.reason).to.equal('Success')
  })

  it('publish c2s', () => {
    const { type, payload, ...tip } =
      _decode_one_hex('3013000a746573742f746f706963006a656c6b6b6b')

    expect(type).to.equal('publish')

    expect(tip)
    .to.deep.equal({
      b0: 0x30,
      props: null,
      qos: 0, dup: false, retain: false,
      topic: 'test/topic', })

    expect(u8_to_utf8(payload)).to.deep.equal('jelkkk')
  })

  it('publish c2s with qos:1', () => {
    const { type, payload, ...tip } =
      _decode_one_hex('3214000a746573742f746f7069630001006a656c6c6f')

    expect(type).to.equal('publish')

    expect(tip)
    .to.deep.equal({
      b0: 0x32,
      props: null,
      pkt_id: 1,
      qos: 1, dup: false, retain: false,
      topic: 'test/topic', })

    expect(u8_to_utf8(payload)).to.deep.equal('jello')
  })

  it('puback s2c with qos:1', () => {
    const { type, ...tip } =
      _decode_one_hex('40020001')

    expect(type).to.equal('puback')

    expect(tip)
    .to.deep.equal({
      b0: 0x40,
      pkt_id: 1,
      props: null,
      reason: undefined,
    })
  })

  it('puback c2s with qos:1 (ejabberd)', () => {
    const { type, ...tip } =
      _decode_one_hex('40022fa3')

    expect(type).to.equal('puback')

    expect(tip)
    .to.deep.equal({
      b0: 0x40,
      pkt_id: 12195,
      props: null,
      reason: undefined,
    })
  })

  it('puback c2s with qos:1 (mosquitto)', () => {
    const { type, ...tip } =
      _decode_one_hex('40020001')

    expect(type).to.equal('puback')

    expect(tip)
    .to.deep.equal({
      b0: 0x40,
      pkt_id: 1,
      props: null,
      reason: undefined,
    })
  })


  it('connect', () => {
    const log = [
      '101000044d5154540502003c032100140000',
      '101a00044d5154540502003c03210014000a64656d6f5f6964656e74',
      '101f00044d5154540502003c03210014000f6964656e745f6d6f73715f64656d6f',
      '102200044d5154540502003c032100140012616e6f746865725f6964656e745f64656d6f',
    ]

    const client_id_list = []
    for (const each of log) {
      const { _base_, type, client_id, flags, ...tip } =
        _decode_one_hex(each)

      expect(type).to.deep.equal('connect')

      expect(_base_.mqtt_level).to.equal(5)
      expect(_base_._base_).to.equal(_base_)

      expect(tip).to.deep.equal({
        b0: 0x10,
        mqtt_level: 5, keep_alive: 60,
        props: {receive_maximum: 20} })

      expect(+flags).to.equal(2)
      expect(2 == flags).to.be.true

      client_id_list.push(client_id)
    }

    expect(client_id_list)
    .to.deep.equal([
      '',
      'demo_ident',
      'ident_mosq_demo',
      'another_ident_demo',
    ])
  })

  it('subscribe qos: 0', () => {
    const { type, hdr, topics, ...tip } =
      _decode_one_hex('8210000100000a746573742f746f70696300')

    expect(type).to.equal('subscribe')

    expect(hdr).to.equal(0x2)
    expect(tip).to.deep.equal({
      b0: 0x82, props: null, pkt_id: 1 })

    expect(
      topics.map(({ topic, opts }) => ({ topic, opts: +opts }))
    ).to.deep.equal([
      { topic: 'test/topic', opts: 0 }
    ])
  })

  it('subscribe qos: 1', () => {
    const { type, hdr, topics, ...tip } =
      _decode_one_hex('8210000100000a746573742f746f70696301')

    expect(type).to.equal('subscribe')

    expect(hdr).to.equal(0x2)
    expect(tip).to.deep.equal({
      b0: 0x82, props: null, pkt_id: 1 })

    expect(
      topics.map(({ topic, opts }) => ({ topic, opts: +opts }))
    ).to.deep.equal([
      { topic: 'test/topic', opts: 1 }
    ])
  })

  it('suback qos: 0', () => {
    const {type, answers, ... tip} = _decode_one_hex( '900400010000' )

    expect(type).to.deep.equal('suback')
    expect(tip).to.deep.equal({
      b0: 0x90, props: null, pkt_id: 1})

    expect(answers).to.have.length(1)
    expect(+answers[0]).to.equal(0)
    expect(answers[0].reason).to.equal('Granted QoS 0')
  })

  it('suback qos: 1', () => {
    const {type, answers, ... tip} = _decode_one_hex( '900400010001' )

    expect(type).to.deep.equal('suback')
    expect(tip).to.deep.equal({
      b0: 0x90, props: null, pkt_id: 1})

    expect(answers).to.have.length(1)
    expect(+answers[0]).to.equal(1)
    expect(answers[0].reason).to.equal('Granted QoS 1')
  })

  it('publish s2c (mosquitto)', () => {
    const { type, hdr, payload, ...tip } =
      _decode_one_hex('3012000a746573742f746f706963006a656c6c6f')

    expect(type).to.equal('publish')

    expect(hdr).to.equal(0)
    expect(tip).to.deep.equal({ b0: 0x30,
      props: null,
      qos: 0, dup: false, retain: false,
      topic: 'test/topic', })

    expect(u8_to_utf8(payload)).to.equal('jello')
  })

  it('publish s2c (jabberd)', () => {
    const { type, hdr, payload, ...tip } =
      _decode_one_hex('3214000a746573742f746f706963cea0006a656c6c6f')

    expect(type).to.equal('publish')

    expect(hdr).to.equal(2)
    expect(tip).to.deep.equal({ b0: 0x32,
      props: null,
      pkt_id: 52896,
      qos: 1, dup: false, retain: false,
      topic: 'test/topic', })

    expect(u8_to_utf8(payload)).to.equal('jello')
  })

  describe('connack with invalid properties', () => {

    it('connack with single invalid property enum=0', () => {
      const { type, reason, flags, ...tip } =
        _decode_one_hex('200600000300000a')

      expect(type).to.equal('connack')
      expect(tip).to.deep.equal({
        b0: 0x20, props: { _unknown_: 0 }})
    })

    it('connack with single invalid property enum=0xff', () => {
      const { type, reason, flags, ...tip } =
        _decode_one_hex('2006000003fa000a')

      expect(type).to.equal('connack')
      expect(tip).to.deep.equal({
        b0: 0x20, props: { _unknown_: 250 }})
    })

    it('connack with invalid first of three properties', () => {
      const { type, reason, flags, ...tip } =
        _decode_one_hex('2009000006ffbb17cc25dd')

      expect(type).to.equal('connack')
      expect(tip).to.deep.equal({
        b0: 0x20, props: { _unknown_: 255 }})
    })

    it('connack with invalid second of three properties', () => {
      const { type, reason, flags, ...tip } =
        _decode_one_hex('200900000601bbfffc25dd')

      expect(type).to.equal('connack')
      expect(tip).to.deep.equal({
        b0: 0x20, props: {
          payload_format_indicator: 0xbb,
          _unknown_: 255
        }})
    })

    it('connack with invalid third of three properties', () => {
      const { type, reason, flags, ...tip } =
        _decode_one_hex('200900000601bb17ccfffd')

      expect(type).to.equal('connack')
      expect(tip).to.deep.equal({
        b0: 0x20, props: {
          payload_format_indicator: 0xbb,
          request_problem_information: 0xcc,
          _unknown_: 255
        }})
    })
  })
})
