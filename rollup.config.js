import typescript from 'rollup-plugin-typescript2'


const formats = ['cjs', 'es']

const config = [
  {
    input: 'src/index.ts',
    output: [
      { file: `dist/index.cjs.js`, format: 'cjs' },
      { file: `dist/index.es.js`, format: 'es' },
    ],
    external: [
      'fs',
      'path',
      'archiver',
      'archiver-zip-encryptable',
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
  }
];

export default config
