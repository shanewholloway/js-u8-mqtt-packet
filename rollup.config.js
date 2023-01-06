import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'
import rpi_terser from '@rollup/plugin-terser'
import {builtinModules} from 'module'

let _cfg_ = {
  external: id => /^\w*:/.test(id) || builtinModules.includes(id),
  plugins: [ rpi_dgnotify(), rpi_resolve() ] }


let is_watch = process.argv.includes('--watch')
let cfg_web_min = is_watch ? null : { ... _cfg_,
  plugins: [ ... _cfg_.plugins, rpi_terser() ]}


export default [
  ... add_module('index', {min: true}),

  ... add_module('codec_v5_full', {min: true}),
  ... add_module('codec_v5_lean', {min: true}),
  ... add_module('codec_v5_client', {min: true}),

  ... add_module('codec_v4_full', {min: true}),
  ... add_module('codec_v4_client', {min: true}),
  ... add_module('codec_v4_lean', {min: true}),
]



function * add_module(src_name, opt={}) {
  let input = `code/${src_name}.mjs`

  yield ({ ..._cfg_, input,
    output: { file: `esm/${src_name}.js`, format: 'es', sourcemap: true } })

  if (opt.min && cfg_web_min)
    yield ({ ...cfg_web_min, input,
      output: { file: `esm/${src_name}.min.js`, format: 'es', sourcemap: false }})
}
