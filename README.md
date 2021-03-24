# rollup-plugin-zip-encryptable

[Rollup](https://github.com/rollup/rollup) plugin to zip up emitted files. Work with password.

This plugin was inspired by the
[rollup-plugin-zip](https://github.com/mentaljam/rollup-plugin-zip).


## Install

```sh
npm i -D rollup-plugin-zip-encryptable
```

## Usage

```js
// rollup.config.js

import zipEncryptable from 'rollup-plugin-zip-encryptable'


export default {
  input: 'index.js',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    zipEncryptable({
      // file: './dist/test.zip',
      dir: './dist/',
      zlib: { level: 9 },
      forceLocalTime: true,
      password: '123456',
    }),
  ],
}
```

## Options

See details [node-archiver-zip-encryptable](https://github.com/ksoichiro/node-archiver-zip-encryptable) and [Archiver](https://www.archiverjs.com/docs/archiver)

```typescript
interface IPluginOptions {
  /**
   * Optional name or path to the output zip file. Relative paths are resolved in the Rollup destination directory.
   */
  file?: string;
  /**
   * Optional path to the directory where to write the output zip file. (Rollup destination directory if file is not set. If file is set then dir is ignored.)
   */
  dir?: string;
  /**
   * Password protected zip.
   */
  password?: string;
  /**
   * Sets the zip archive comment.
   */
  comment?: string;
  /**
   * Forces the archive to contain local file times instead of UTC.
   */
  forceLocalTime?: boolean;
  /**
   * Forces the archive to contain ZIP64 headers.
   */
  forceZip64?: boolean;
  /**
   * Prepends a forward slash to archive file paths.
   */
  namePrependSlash?: boolean;
  /**
   * Sets the compression method to STORE.
   */
  store?: boolean;
  /**
   * Passed to zlib to control compression.
   * @default { level: 9 }
   */
  zlib?: object;
  /**
   * Create zip file once. Useful in watch mode.
   * @default false
   */
  createOnce?: false,
  /**
   * Filter out the files that are not packaged into the zip package.
   * Returning true has just been filtered out.
   * @default null
   */
  filterFile?: (entry: OutputAsset | OutputChunk) => boolean;
}
```

## License

[MIT](LICENSE) © [asins](mailto:asinsimple@gmail.com)
