import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'

const _cfg_ = {
  external: [],
  plugins: [
    rpi_dgnotify(),
    rpi_resolve(),
  ]}


const _out_ = { sourcemap: true }

export default [
  { ... _cfg_,
    input: `./unittest.mjs`,
    output: { ..._out_, file: './__unittest.cjs.js', format: 'cjs' } },

  { ... _cfg_, context: 'window',
    input: `./unittest.mjs`,
    output: { ..._out_, file: './__unittest.iife.js', format: 'iife', name: `unittest` } },
]
