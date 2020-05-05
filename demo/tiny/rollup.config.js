import rpi_resolve from '@rollup/plugin-node-resolve'
import { terser as rpi_terser } from 'rollup-plugin-terser'

const plugins = [rpi_resolve(), rpi_terser()]
const external = ['net']

export default [
  { input: `demo_web.mjs`, output: { file: `esm/demo_web.min.mjs`, format: 'es', sourcemap: false }, plugins},
  { input: `demo_node.mjs`, output: { file: `esm/demo_node.min.mjs`, format: 'es', sourcemap: false  }, plugins, external},
  { input: `demo_node.mjs`, output: { file: `esm/demo_node.mjs`, format: 'es', sourcemap: false  }, plugins:[rpi_resolve()], external},
]
