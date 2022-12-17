import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'
import rpi_terser from '@rollup/plugin-terser'
import {builtinModules} from 'module'

const _cfg_ = {
  external: id => /^\w*:/.test(id) || builtinModules.includes(id),
  plugins: [ rpi_dgnotify(), rpi_resolve() ] }


let is_watch = process.argv.includes('--watch')
const cfg_web_min = is_watch ? null : { ... _cfg_,
  plugins: [ ... _cfg_.plugins, rpi_terser() ]}


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
      { file: `esm/${src_name}.mjs`, format: 'es', sourcemap: true },
      { file: `cjs/${src_name}.cjs`, format: 'cjs', exports: 'named', sourcemap: true },
      opt.name && 
        { file: `umd/${src_name}.js`, format: 'umd', name: opt.name, exports: 'named', sourcemap: true },
    ].filter(Boolean)})

  if (opt.min && cfg_web_min)
    configs.push({ ...cfg_web_min, input,
      output: [
        { file: `esm/${src_name}.min.mjs`, format: 'es', sourcemap: false },
        opt.name && 
          { file: `umd/${src_name}.min.js`, format: 'umd', name: opt.name, exports: 'named', sourcemap: false },
      ].filter(Boolean)})
}
