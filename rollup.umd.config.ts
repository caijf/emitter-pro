import type { RollupOptions } from 'rollup';
import terser from '@rollup/plugin-terser';
import { outputFilePrefix, commonConfig } from './rollup.config';

const globalVariableName = 'EmitterPro';

const config: RollupOptions = {
  ...commonConfig,
  output: [
    {
      format: 'umd',
      file: `${outputFilePrefix}.js`,
      exports: 'default',
      name: globalVariableName,
      sourcemap: true
    },
    {
      format: 'umd',
      file: `${outputFilePrefix}.min.js`,
      exports: 'default',
      name: globalVariableName,
      sourcemap: true,
      plugins: [terser()]
    }
  ]
};

export default config;
