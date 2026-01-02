import { hex_to_u8, u8_to_utf8 } from 'u8-utils'
import { mqtt_opts_v5, mqtt_pkt_ctx } from 'u8-mqtt-packet'

import {describe, it} from '#test_bdd'
import {assert, expect} from 'chai'

describe('mqtt_pkt_ctx api', () => {
  let hex_connect = '101b00044d5154540402003c000f6d7174746a735f3535393263333833'

  describe('basic', () => {
    it('v5', () => {
      let mqtt_ctx = mqtt_pkt_ctx(5, mqtt_opts_v5)
      expect(mqtt_ctx.pkt_ctx.mqtt_level).to.equal(5)
      assert_mqtt_ctx(mqtt_ctx)

      expect(mqtt_ctx.pkt_ctx.my_extension_fn).to.not.exist
    })

    it('v4', () => {
      let mqtt_ctx = mqtt_pkt_ctx(4, mqtt_opts_v5)
      expect(mqtt_ctx.pkt_ctx.mqtt_level).to.equal(4)
      assert_mqtt_ctx(mqtt_ctx)

      expect(mqtt_ctx.pkt_ctx.my_extension_fn).to.not.exist
    })

    it('v?', () => {
      let mqtt_ctx = mqtt_pkt_ctx('?', mqtt_opts_v5)
      expect(mqtt_ctx.pkt_ctx.mqtt_level).to.equal('?')
      assert_mqtt_ctx(mqtt_ctx)

      expect(mqtt_ctx.pkt_ctx.my_extension_fn).to.not.exist
    })
  })

  describe('api extension', () => {
    let my_api_extension = {
      my_extension_fn() { return JSON.stringify({... this}) }
    }
    let hex_subscribe_v4 = '0f82e3000a746573742f746f70696300'
    let expected_subscribe_v4_json = '{"b0":130,"pkt_id":0,"topics":[]}'
    let hex_subscribe_v5 = '10000100000a746573742f746f70696300'
    let expected_subscribe_v5_json = '{"b0":130,"pkt_id":256,"props":null,"topics":[]}'

    it('v5 with subscribe', () => {
      let mqtt_ctx = mqtt_pkt_ctx(5, mqtt_opts_v5, my_api_extension)
      expect(mqtt_ctx.pkt_ctx.mqtt_level).to.equal(5)
      assert_mqtt_ctx(mqtt_ctx)

      expect(mqtt_ctx.pkt_ctx.my_extension_fn).to.exist

      if (1) {
        let pkt_sub = mqtt_ctx.decode_pkt(0x82, hex_subscribe_v5) 
        expect(pkt_sub.my_extension_fn()).to.equal(expected_subscribe_v5_json)
      }
    })

    it('v4 with subscribe', () => {
      let mqtt_ctx = mqtt_pkt_ctx(4, mqtt_opts_v5, my_api_extension)
      expect(mqtt_ctx.pkt_ctx.mqtt_level).to.equal(4)
      assert_mqtt_ctx(mqtt_ctx)

      expect(mqtt_ctx.pkt_ctx.my_extension_fn).to.exist

      if (1) {
        let pkt_sub = mqtt_ctx.decode_pkt(0x82, hex_subscribe_v4) 
        expect(pkt_sub.my_extension_fn()).to.equal(expected_subscribe_v4_json)
      }
    })

    it('v? with subscribe', () => {
      let mqtt_ctx = mqtt_pkt_ctx('?', mqtt_opts_v5, my_api_extension)
      expect(mqtt_ctx.pkt_ctx.mqtt_level).to.equal('?')
      assert_mqtt_ctx(mqtt_ctx)

      expect(mqtt_ctx.pkt_ctx.my_extension_fn).to.exist

      if (1) {
        let sub_ctx = mqtt_ctx.mqtt_stream()
        sub_ctx.pkt_ctx.mqtt_level = 4 // simulate a connection packet

        let pkt_sub = sub_ctx.decode_pkt(0x82, hex_subscribe_v4) 
        expect(pkt_sub.my_extension_fn()).to.equal(expected_subscribe_v4_json)
      }
      if (1) {
        let sub_ctx = mqtt_ctx.mqtt_stream()
        sub_ctx.pkt_ctx.mqtt_level = 5 // simulate a connection packet

        let pkt_sub = sub_ctx.decode_pkt(0x82, hex_subscribe_v5) 
        expect(pkt_sub.my_extension_fn()).to.equal(expected_subscribe_v5_json)
      }
    })
  })

  function assert_mqtt_ctx(mqtt_raw_ctx) {
    if (1) {
      expect(mqtt_raw_ctx.encode_pkt).to.be.a('function')
      expect(mqtt_raw_ctx.decode_pkt).to.be.a('function')
      expect(mqtt_raw_ctx.mqtt_stream).to.be.a('function')
      expect(mqtt_raw_ctx.decode).to.be.undefined

      let {pkt_ctx} = mqtt_raw_ctx
      expect(pkt_ctx).to.exist
      expect(pkt_ctx).to.have.own.property('mqtt_level')
      expect(pkt_ctx).to.have.own.property('hdr')
      expect(pkt_ctx).to.have.own.property('id')
      expect(pkt_ctx).to.have.own.property('type')
    }

    let mqtt_ctx = mqtt_raw_ctx.mqtt_stream()

    if (1) {
      expect(mqtt_ctx.encode_pkt).to.be.a('function')
      expect(mqtt_ctx.decode_pkt).to.be.a('function')
      expect(mqtt_ctx.mqtt_stream).to.be.a('function')
      expect(mqtt_ctx.decode).to.be.a('function')
      expect(mqtt_ctx.pkt_ctx).to.exist
        .and.to.not.equal(mqtt_raw_ctx.pkt_ctx)
    }

    if (1) {
      let pkt_connect = _decode_hex(mqtt_ctx, hex_connect)
      expect(pkt_connect.type).to.equal('connect')
      expect(pkt_connect.b0).to.equal(0x10)
      expect(pkt_connect).to.have.own.property('mqtt_level')

      expect(mqtt_ctx.pkt_ctx).to.have.own.property('mqtt_level')
      expect(pkt_connect.mqtt_level).to.equal(mqtt_ctx.pkt_ctx.mqtt_level)
    }

    if (1) {
      let pkt_ping = _decode_hex(mqtt_ctx, 'd000')
      expect(pkt_ping.type).to.equal('pingresp')
      expect(pkt_ping.b0).to.equal(0xd0)
      expect(pkt_ping).to.not.have.own.property('mqtt_level')
      expect(pkt_ping.mqtt_level).to.equal(mqtt_ctx.pkt_ctx.mqtt_level)
    }
  }

  function _decode_hex(mqtt_ctx, hex_pkt) {
    let [pkt0, pkt1] = mqtt_ctx.decode(hex_to_u8(hex_pkt))
    expect(pkt1).to.be.undefined
    return pkt0
  }
})
