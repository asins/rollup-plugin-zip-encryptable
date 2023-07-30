import typescript from '@rollup/plugin-typescript'


const formats = ['cjs', 'es']

const config = [
  {
    input: 'src/index.ts',
    output: [
      { file: `dist/index.cjs.js`, format: 'cjs', exports: 'default', sourceMap: true },
      { file: `dist/index.es.js`, format: 'es', exports: 'default', sourceMap: true },
    ],
    external: [
      'fs',
      'path',
      'archiver',
      'archiver-zip-encryptable',
    ],
    plugins: [
      typescript({
        // tsconfig: './tsconfig.json',
        sourceMap: true,
        inlineSources: true,
      }),
    ],
  }
];

export default config
