import {builtinModules} from 'module'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'

let _cfg_common = {
  plugins: [ rpi_dgnotify(), rpi_resolve() ]}
let _cfg_node = { ... _cfg_common,
  external: id => /^\w*:/.test(id) || builtinModules.includes(id) }
let _cfg_web = { ... _cfg_common,
  external: id => /^\w*:/.test(id),
  context: 'window' }


export default [
  { ... _cfg_node,
    input: `./unittest.js`,
    output: { file: './__unittest.cjs', format: 'cjs', sourcemap: true } },

  { ... _cfg_node,
    input: `./integ.node.js`,
    output: { file: './__integ.node.cjs', format: 'cjs', sourcemap: true } },

  { ... _cfg_node,
    input: `./all.node.js`,
    output: { file: './__alltests.cjs', format: 'cjs', sourcemap: true } },


  { ... _cfg_web,
    input: `./unittest.js`,
    output: { file: './__unittest.iife.js', format: 'iife', name: `unittest`, sourcemap: true } },

  { ... _cfg_web,
    input: `./integ.web.js`,
    output: { file: './__integ.web.js', format: 'iife', name: `integtest`, sourcemap: true } },
]
