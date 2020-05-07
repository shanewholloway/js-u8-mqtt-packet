import { hex_to_u8, u8_to_utf8 } from 'u8-utils'
import { mqtt_session_ctx } from 'u8-mqtt-packet'

const { assert, expect } = require('chai')

function _decode_one_hex(hex_pkt) {
  const [mqtt_decode] = mqtt_session_ctx().v4()
  const [pkt0, pkt1] = mqtt_decode(hex_to_u8(hex_pkt))
  expect(pkt1).to.be.undefined
  return pkt0
}

describe('mqtt v4: small pub/sub capture', () => {
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

  it('connack', () => {
    const { type, reason, flags, ...tip } =
      _decode_one_hex('20020000')

    expect(type).to.equal('connack')

    expect(tip)
    .to.deep.equal({ b0: 0x20, })

    expect(+flags).to.equal(0)
    expect(0 == flags).to.be.true

    expect(0 == reason).to.be.true
    expect(+reason).to.equal(0)
    expect(reason.reason).to.equal('Success')
  })

  it('publish c2s', () => {
    const { type, payload, ...tip } =
      _decode_one_hex('3012000a746573742f746f7069636a656c6b6b6b')

    expect(type).to.equal('publish')

    expect(tip)
    .to.deep.equal({
      b0: 0x30,
      qos: 0, dup: false, retain: false,
      topic: 'test/topic', })

    expect(u8_to_utf8(payload)).to.deep.equal('jelkkk')
  })

  it('connect', () => {
    const log = [
      '101b00044d5154540402003c000f6d7174746a735f3535393263333833',
      '101b00044d5154540402003c000f6d7174746a735f3634613034376237',
      '101b00044d5154540402003c000f6d7174746a735f3863623265306265',
      '101b00044d5154540402003c000f6d7174746a735f3961373331313935',
      '101b00044d5154540402003c000f6d7174746a735f6366646433626636',
      '101b00044d5154540402003c000f6d7174746a735f6431623263316532',
    ]

    const client_id_list = []
    for (const each of log) {
      const { _base_, type, client_id, flags, ...tip } =
        _decode_one_hex(each)

      expect(type).to.deep.equal('connect')

      expect(_base_.mqtt_level).to.equal(4)
      expect(_base_._base_).to.equal(_base_)

      expect(tip).to.deep.equal({
        b0: 0x10,
        mqtt_level: 4, keep_alive: 60, })

      expect(+flags).to.equal(2)
      expect(2 == flags).to.be.true

      client_id_list.push(client_id)
    }

    expect(client_id_list)
    .to.deep.equal([
      'mqttjs_5592c383',
      'mqttjs_64a047b7',
      'mqttjs_8cb2e0be',
      'mqttjs_9a731195',
      'mqttjs_cfdd3bf6',
      'mqttjs_d1b2c1e2',
    ])
  })

  it('subscribe', () => {
    const log = [
      '820f82e3000a746573742f746f70696300',
      '820f82e4000a746573742f746f70696300',
      '820fc5a2000a746573742f746f70696300',
    ]

    const packet_id_list = []
    for (const each of log) {
      const { type, hdr, pkt_id, topics, ...tip } =
        _decode_one_hex( each )

      expect(type).to.equal('subscribe')

      packet_id_list.push(pkt_id)
      expect(hdr).to.equal(0x2)
      expect(tip).to.deep.equal({ b0: 0x82 })

      expect(
        topics.map(({ topic, opts }) => ({ topic, opts: +opts }))
      ).to.deep.equal([
        { topic: 'test/topic', opts: 0 }
      ])
    }

    expect(packet_id_list)
    .to.deep.equal([33507, 33508, 50594])
  })

  it('suback', () => {
    const log = ['900382e300', '900382e400', '9003c5a200']

    const packet_id_list = []
    for (const each of log) {
      const { type, pkt_id, answers, ...tip } =
        _decode_one_hex( each )

      expect(type).to.deep.equal('suback')

      packet_id_list.push(pkt_id)
      expect(tip).to.deep.equal({
        b0: 0x90})

      expect(answers.map((a) => +a)).to.deep.equal([0])
    }

    expect(packet_id_list).to.deep.equal([33507, 33508, 50594])
  })

  it('publish s2c', () => {
    const { type, hdr, payload, ...tip } =
      _decode_one_hex('3111000a746573742f746f7069636a656c6c6f')

    expect(type).to.equal('publish')

    expect(hdr).to.equal(0x1)
    expect(tip).to.deep.equal({ b0: 0x31,
      qos: 0, dup: false, retain: true,
      topic: 'test/topic', })

    expect(u8_to_utf8(payload)).to.equal('jello')
  })
})
