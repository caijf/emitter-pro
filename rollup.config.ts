import type { RollupOptions } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const globalVariableName = 'EmitterPro';
const outputDir = 'dist';
const pkgName = 'emitter-pro';
const outputFilePrefix = `${outputDir}/${pkgName}`;
const commonConfig = {
  input: 'src/index.ts',
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.build.json'
    })
  ]
};

const config: RollupOptions[] = [
  {
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
    ]
  },
  {
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
  }
];

export default config;
