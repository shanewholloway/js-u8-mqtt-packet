import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'
// import rpi_commonjs from '@rollup/plugin-commonjs'


const _cfg_ = {
  external: [],
  plugins: [
    rpi_dgnotify(),
    rpi_resolve(),
    // rpi_commonjs(), // Allow CommonJS use -- https://github.com/rollup/plugins/tree/master/packages/commonjs#readme
  ]}


const cfg_node = { ..._cfg_,
  plugins: [
    rpi_jsy({defines: {PLAT_NODEJS: true}}),
    ... _cfg_.plugins ]}

const cfg_web = { ..._cfg_,
  context: 'window',
  plugins: [
    rpi_jsy({defines: {PLAT_WEB: true}}),
    ... _cfg_.plugins ]}


const _out_ = { sourcemap: true }

export default [
  { ... cfg_node,
    input: `./unittest.jsy`,
    output: { ..._out_, file: './__unittest.cjs.js', format: 'cjs' } },

  { ... cfg_web,
    input: `./unittest.jsy`,
    output: { ..._out_, file: './__unittest.iife.js', format: 'iife', name: `unittest` } },
]
