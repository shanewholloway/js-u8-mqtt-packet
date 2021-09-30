import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'
import { terser as rpi_terser } from 'rollup-plugin-terser'
import {builtinModules} from 'module'

const DEBUG = false

const _cfg_ = {
  external: id => /^node:/.test(id) || builtinModules.includes(id),
  plugins: [ rpi_dgnotify(), rpi_resolve() ] }

const cfg_web_min = DEBUG ? null : { ... _cfg_,
  plugins: [ ... _cfg_.plugins, rpi_terser() ]}

const _out_ = { sourcemap: true }


const configs = []
export default configs


add_module('index', {})
add_module('session', {min: true})

add_module('client/core_node', {})
add_module('client/core_deno', {})
add_module('client/core_web', {min: true})
add_module('client/node', {})
add_module('client/deno', {})
add_module('client/web', {min: true})



function add_module(src_name, opt={}) {
  const input = `code/${src_name}.mjs`
  configs.push({ ..._cfg_, input,
    output: [
      { ..._out_, file: `esm/${src_name}.mjs`, format: 'es' },
      { ..._out_, file: `cjs/${src_name}.cjs`, format: 'cjs', exports: 'named' },
      opt.name && 
        { ..._out_, file: `umd/${src_name}.js`, format: 'umd', name: opt.name, exports: 'named' },
    ].filter(Boolean)})

  if (opt.min && cfg_web_min)
    configs.push({ ...cfg_web_min, input,
      output: [
        { ..._out_, file: `esm/${src_name}.min.mjs`, format: 'es' },
        opt.name && 
          { ..._out_, file: `umd/${src_name}.min.js`, format: 'umd', name: opt.name, exports: 'named' },
      ].filter(Boolean)})
}
