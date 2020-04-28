import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'
import { terser as rpi_terser } from 'rollup-plugin-terser'
import {builtinModules} from 'module'

const DEBUG = false

const _cfg_ = {
  plugins: [
    rpi_dgnotify(),
    rpi_jsy({defines:{DEBUG}}),
    rpi_resolve(),
  ],
  external: id => builtinModules.includes(id),
}

const cfg_web_min = DEBUG ? null : { ... _cfg_,
  plugins: [ ... _cfg_.plugins, rpi_terser() ]}

const _out_ = { sourcemap: true }


const configs = []
export default configs


add_jsy('index')
add_jsy('session', {min: true})

add_jsy('client/node')
add_jsy('client/web', {min: true})

if (1) {
  add_jsy('tiny/session', {min: true})
  add_jsy('tiny/node')
  add_jsy('tiny/web', {min: true})
}

if (1) {
  add_jsy('demo/node')
  add_jsy('demo/web', {min: true})
  add_jsy('demo/node_tiny')
  add_jsy('demo/web_tiny', {min: true})

  add_jsy('demo/_mitm')
}



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
