import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { PluginOption, ResolvedConfig } from 'vite';
import { Codecs, SharpEncodeOptions } from './build-sharp.types';
import { BUILD_SHARP_PLUGIN_NAME, filterFile, handleOutputLogger, readAllFiles } from './build-sharp.utils';

const extensions = /.(jpe?g|png|webp)/;

const SHARP_CONFIG: Partial<Record<Codecs, SharpEncodeOptions>> = {
  jpeg: { quality: 100, mozjpeg: true },
  png: { quality: 85, compressionLevel: 8 },
  webp: { quality: 85 },
};

interface BuildSharpPluginOptions {
  enabled: boolean;
}

export function BuildSharpPlugin({ enabled }: BuildSharpPluginOptions) {
  if (!enabled) {
    return null;
  }

  let outputPath: string;
  let publicDir: string;
  let config: ResolvedConfig;
  const mtimeCache = new Map<string, number>();
  const tinyMap = new Map<string, { size: number; oldSize: number; ratio: number }>();

  const processFile = async (filePath: string, buffer: Buffer) => {
    try {
      const image = sharp(buffer);
      const { format } = await image.metadata();
      const content = await image[format](SHARP_CONFIG[format]).toBuffer();

      const size = content.byteLength;
      const oldSize = buffer.byteLength;

      tinyMap.set(filePath, {
        size: size / 1024,
        oldSize: oldSize / 1024,
        ratio: size / oldSize - 1,
      });

      return content;
    } catch {
      config.logger.error(`${BUILD_SHARP_PLUGIN_NAME} error: ${filePath}`);
    }
  };

  return {
    name: BUILD_SHARP_PLUGIN_NAME,
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      outputPath = config.build.outDir;
      publicDir = config.publicDir as string;
    },
    async generateBundle(_, bundler) {
      const files = Object.keys(bundler).filter((key) => filterFile(path.resolve(outputPath, key), extensions));

      if (!files.length) {
        return;
      }

      await Promise.all(
        files.map(async (filePath: string) => {
          const source = (bundler[filePath] as any).source;
          const content = await processFile(filePath, source);
          if (content) {
            (bundler[filePath] as any).source = content;
          }
        }),
      );
    },
    async closeBundle() {
      // try to find any static images in original static folder
      const files = readAllFiles(publicDir).filter((file) => filterFile(file, extensions));

      await Promise.all(
        files.map(async (publicFilePath: string) => {
          const filePath = publicFilePath.replace(publicDir + path.sep, '');
          const fullFilePath = path.join(outputPath, filePath);

          if (!fs.existsSync(fullFilePath)) {
            return;
          }

          const { mtimeMs } = await fs.stat(fullFilePath);
          if (mtimeMs <= (mtimeCache.get(filePath) || 0)) {
            return;
          }

          const buffer = await fs.readFile(fullFilePath);
          const content = await processFile(filePath, buffer);

          if (content) {
            await fs.writeFile(fullFilePath, content);
            mtimeCache.set(filePath, Date.now());
          }
        }),
      );

      if (tinyMap.size === 0) {
        return;
      }

      handleOutputLogger(config, tinyMap);
    },
  } as PluginOption;
}
