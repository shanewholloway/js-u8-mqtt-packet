import { encode_varint, decode_varint } from 'u8-mqtt-packet'

import {describe, it} from '#test_bdd'
import {assert, expect} from 'chai'

describe('mqtt_varint', ()=>{
  function _test_varint(v, {expected_length}) {
    let a = encode_varint(v)
    assert.equal(a.length, expected_length, "Varint to have expected length")

    let [n, i] = decode_varint(a)
    assert.equal(i, expected_length, "Decoded expected length")
    assert.equal(n, v, "Round trip values to be equal")
  }

  it('Value 0', ()=> _test_varint(0, {expected_length: 1}))
  it('Value 1', ()=> _test_varint(1, {expected_length: 1}))

  it('Value 127', ()=> _test_varint(127, {expected_length: 1}))
  it('Value 128', ()=> _test_varint(16383, {expected_length: 2}))

  it('Value 16383', ()=> _test_varint(16383, {expected_length: 2}))
  it('Value 16384', ()=> _test_varint(16384, {expected_length: 3}))

  it('Value 159151', ()=> _test_varint(159151, {expected_length: 3}))

  it('Value 2097151', ()=> _test_varint(2097151, {expected_length: 3}))
  it('Value 2097152', ()=> _test_varint(2097152, {expected_length: 4}))

  it('Value 68435455', ()=> _test_varint(68435455, {expected_length: 4}))

  it('Value 0x0fff_ffff', ()=> _test_varint(0x0fffffff, {expected_length: 4}))
  it('Error for encode value 0x10000000', ()=> expect(()=>encode_varint(0x10000000)).to.throw())
  it('Error for decode value 0x10000000', ()=> expect(()=>decode_varint([128,128,128,128,1])).to.throw())
  it('Error for encode value 0x7fffffff', ()=> expect(()=>encode_varint(0x7fffffff)).to.throw())


  it('Values [0..127]', ()=>{
    let opt = {expected_length: 1}
    for (let v=0; v<=127; v++)
      _test_varint(v, opt)
  })

  it('Values [128..16383]', ()=>{
    let opt = {expected_length: 2}
    for (let v=128; v<=16383; v++)
      _test_varint(v, opt)
  })

  it('Value partial is undefined', ()=> {
    let pad = ['p','a','d']
    expect(decode_varint([...pad], pad.length)[0]).is.undefined
    expect(decode_varint([...pad, 128], pad.length)[0]).is.undefined
    expect(decode_varint([...pad, 128, 128], pad.length)[0]).is.undefined
    expect(decode_varint([...pad, 128, 128, 128], pad.length)[0]).is.undefined
  })

  it('Value partial is NaN', ()=> {
    let pad = ['p','a','d','d','i','n','g']
    expect(decode_varint([...pad], pad.length, NaN)[0]).is.NaN
    expect(decode_varint([...pad, 128], pad.length, NaN)[0]).is.NaN
    expect(decode_varint([...pad, 128, 128], pad.length, NaN)[0]).is.NaN
    expect(decode_varint([...pad, 128, 128, 128], pad.length, NaN)[0]).is.NaN
  })
})

