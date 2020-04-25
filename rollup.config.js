import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import { terser as rpi_terser } from 'rollup-plugin-terser'
import {builtinModules} from 'module'

const DEBUG = ! true

const _cfg_ = {
  plugins: [
    rpi_dgnotify(),
    rpi_jsy({defines:{DEBUG}}),
  ],
  external: id =>
    id.startsWith('u8-mqtt-packet')
      || builtinModules.includes(id),
}

const cfg_web_min = DEBUG ? null : { ... _cfg_,
  plugins: [ ... _cfg_.plugins, rpi_terser() ]}

const _out_ = { sourcemap: true }


const configs = []
export default configs


add_jsy('index')
add_jsy('codec', {min: true})
add_jsy('codec_tiny', {min: true})

add_jsy('_test')
add_jsy('_mitm')



function add_jsy(src_name, opt={}) {
  configs.push({ ..._cfg_,
    input: `code/${src_name}.jsy`,
    output: [
      { ..._out_, file: `esm/${src_name}.mjs`, format: 'es' },
      { ..._out_, file: `cjs/${src_name}.cjs`, format: 'cjs', exports: opt.exports || 'named' },
      opt.name && 
        { ..._out_, file: `umd/${src_name}.js`, format: 'umd', name: opt.name, exports:'named' },
    ].filter(Boolean)})

  if (opt.min && cfg_web_min)
    configs.push({ ...cfg_web_min,
      input: `code/${src_name}.jsy`,
      output: [
        { ..._out_, file: `esm/${src_name}.min.mjs`, format: 'es' },
        opt.name && 
          { ..._out_, file: `umd/${src_name}.min.js`, format: 'umd', name: opt.name, exports:'named' },
      ].filter(Boolean)})
}
