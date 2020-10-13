import {builtinModules} from 'module'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'

const _cfg_common = {
  plugins: [ rpi_dgnotify(), rpi_resolve() ]}
const _cfg_node = { ... _cfg_common,
  external: id => builtinModules.includes(id) }
const _cfg_web = { ... _cfg_common,
  external: [], context: 'window' }


const _out_ = { sourcemap: true }

export default [
  { ... _cfg_node,
    input: `./unittest.mjs`,
    output: { ..._out_, file: './__unittest.cjs', format: 'cjs' } },

  { ... _cfg_node,
    input: `./integ.node.mjs`,
    output: { ..._out_, file: './__integ.node.cjs', format: 'cjs' } },

  { ... _cfg_node,
    input: `./all.node.mjs`,
    output: { ..._out_, file: './__alltests.cjs', format: 'cjs' } },


  { ... _cfg_web,
    input: `./unittest.mjs`,
    output: { ..._out_, file: './__unittest.iife.js', format: 'iife', name: `unittest` } },

  { ... _cfg_web,
    input: `./integ.web.mjs`,
    output: { ..._out_, file: './__integ.web.js', format: 'iife', name: `integtest` } },
]
