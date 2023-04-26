import type { RollupOptions } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export const outputDir = 'dist';
export const pkgName = 'emitter-pro';
export const outputFilePrefix = `${outputDir}/${pkgName}`;
export const commonConfig = {
  input: 'src/index.ts',
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      include: ['src/**/*'],
      tsconfig: './tsconfig.json'
    })
  ]
};

const config: RollupOptions = {
  ...commonConfig,
  output: [
    {
      format: 'cjs',
      file: `${outputFilePrefix}.cjs.js`,
      exports: 'default'
    },
    {
      format: 'es',
      file: `${outputFilePrefix}.esm.js`,
      exports: 'default'
    }
  ],
  external: ['tslib']
};

export default config;
