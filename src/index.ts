import * as fs from 'fs'
import * as path from 'path'
import {OutputAsset, OutputChunk, Plugin} from 'rollup'
import archiver from 'archiver';
import ZipEncryptable from 'archiver-zip-encryptable';
import { green, bold } from 'colorette';

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

const isAsset = (entry: OutputAsset | OutputChunk): entry is OutputAsset => (
  entry.type === 'asset'
)
let isRegistered = false;


const enum Cache {
  distdir = 'distdir',
  outfile = 'outfile',
  sourcemapFile = 'sourcemapFile',
}

export default (options: IPluginOptions = {}): Plugin => {
  let zipCreated = false;
  const {
    createOnce = false,
  } = options;
  
  return {
    name: 'archiverZip',

    generateBundle({ dir }): void {
      if(createOnce && zipCreated) return;

      // Save the output directory path
      let distDir = process.cwd();
      if (dir) {
        distDir = path.resolve(distDir, dir);
      }
      this.cache.set(Cache.distdir, distDir);
      // Get options
      let outFile = options && options.file;
      const outDir = options && options.dir;
      if (outFile) {
        if (outDir) {
          this.warn('Both the `file` and `dir` options are set - `dir` has no effect');
        }
        if (!path.isAbsolute(outFile)) {
          outFile = path.resolve(distDir, outFile);
        }
      } else {
        const {
          npm_package_name: packageName = 'bundle',
          npm_package_version: packageVersion,
        } = process.env;
        outFile = packageName;
        if (packageVersion) {
          outFile += `-${ packageVersion}`;
        }
        if (outDir && !(fs.existsSync(outDir) && fs.statSync(outDir).isDirectory())) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        outFile = path.resolve(outDir || distDir, `${outFile }.zip`);
      }
      // Save the output file path
      this.cache.set(Cache.outfile, outFile);
    },

    writeBundle(_, bundle): Promise<void> {
      if(createOnce && zipCreated) return Promise.resolve();

      return new Promise(resolve$1 => {
        // const distDir = this.cache.get(Cache.distdir);
        let opt = {
          password: options.password,
          comment: options.comment,
          forceLocalTime: options.forceLocalTime || true,
          forceZip64: options.forceZip64,
          namePrependSlash: options.namePrependSlash,
          store: options.store,
          zlib: options.zlib || { level: 9 },
        } as IPluginOptions;
        // ???????????????????????????
        opt = Object.keys(opt).reduce((res: IPluginOptions, key: string) => {
          if (opt[key] != null) res[key] = opt[key];
          return res;
        }, {} as IPluginOptions);

        let archive;
        if (opt.password) {
          if (!isRegistered) {
            archiver.registerFormat('zip-encryptable', ZipEncryptable);
            isRegistered = true;
          }
          /** @ts-ignore */
          archive = archiver('zip-encryptable', opt);
        } else {
          archive = archiver('zip', opt);
        }

        const outFile = this.cache.get(Cache.outfile);
        const dir = path.dirname(outFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const writeStream = fs.createWriteStream(outFile);
        archive.pipe(writeStream);

        Object.entries(bundle).forEach(([, entry]) => {
          const { fileName } = entry;
          if(typeof options.filterFile === 'function' && options.filterFile(entry)) return;

          if (isAsset(entry)) {
            const { source } = entry;
            archive.append(Buffer.from(source), { name: fileName });
          } else {
            const { map, code } = entry;
            archive.append(Buffer.from(code), { name: fileName });
            if (map) {
              const mapFile = `${fileName }.map`;
              archive.append(Buffer.from(map), { name: mapFile });
            }
          }
        });

        archive.finalize();
        zipCreated = true;
        console.log(green('created zip file:') + ' ' + green(`${bold(outFile)}`));
        writeStream.on('close', resolve$1);
      });
    },
  };
};
