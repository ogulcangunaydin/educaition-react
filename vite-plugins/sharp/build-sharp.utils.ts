import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { ResolvedConfig } from 'vite';

export const BUILD_SHARP_PLUGIN_NAME = 'vite:build-sharp';

export const isRegExp = (arg: unknown): arg is RegExp => Object.prototype.toString.call(arg) === '[object RegExp]';

export const isFunction = (arg: unknown): arg is (...args: any[]) => any => typeof arg === 'function';

export function readAllFiles(root: string, reg?: RegExp) {
  let resultArr: string[] = [];
  try {
    if (fs.existsSync(root)) {
      const stat = fs.lstatSync(root);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(root);
        files.forEach(function (file) {
          const t = readAllFiles(path.join(root, path.sep, file), reg);
          resultArr = resultArr.concat(t);
        });
      } else {
        if (reg !== undefined) {
          if (isFunction(reg.test) && reg.test(root)) {
            resultArr.push(root);
          }
        } else {
          resultArr.push(root);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return resultArr;
}

export function filterFile(file: string, filter: RegExp | ((file: string) => boolean)) {
  if (filter) {
    const isRe = isRegExp(filter);
    const isFn = isFunction(filter);
    if (isRe) {
      return (filter as RegExp).test(file);
    }
    if (isFn) {
      return (filter as (file: any) => any)(file);
    }
  }
  return false;
}

export function handleOutputLogger(
  config: ResolvedConfig,
  recordMap: Map<string, { size: number; oldSize: number; ratio: number }>,
) {
  const title = pc.cyan(`✨ [${BUILD_SHARP_PLUGIN_NAME}]`);
  const message = `\n${title} - compressed image resource successfully: `;
  config.logger.info(message);

  const keyLengths = Array.from(recordMap.keys(), (name) => name.length);
  const valueLengths = Array.from(recordMap.values(), (value) => `${Math.floor(100 * value.ratio)}`.length);

  const maxKeyLength = Math.max(...keyLengths);
  const valueKeyLength = Math.max(...valueLengths);

  let totalOldSize = 0;
  let totalCompressedSize = 0;

  recordMap.forEach((value, name) => {
    let { ratio } = value;
    const { size, oldSize } = value;
    ratio = Math.floor(100 * ratio);
    const fr = `${ratio}`;

    totalOldSize += oldSize;
    totalCompressedSize += size;

    function getDenseRatio() {
      if (ratio > 0) {
        return pc.red(`+${fr}%`);
      }
      if (ratio <= 0) {
        return pc.green(`${fr}%`);
      }
      return '';
    }

    const denseRatio = getDenseRatio();

    const sizeStr = `${oldSize.toFixed(2)}kb / compressed: ${size.toFixed(2)}kb`;

    config.logger.info(
      pc.dim(path.basename(config.build.outDir)) +
        '/' +
        pc.blue(name) +
        ' '.repeat(2 + maxKeyLength - name.length) +
        pc.gray(`${denseRatio} ${' '.repeat(valueKeyLength - fr.length)}`) +
        ' ' +
        pc.dim(sizeStr),
    );
  });

  const totalBandwidthSave = totalOldSize - totalCompressedSize;
  const totalRatio = Math.floor(Math.abs(totalCompressedSize / totalOldSize - 1) * 100);

  const bandwidthRaw = pc.green(pc.underline(`${totalBandwidthSave.toFixed(2)}kb`));
  const bandwidthRatio = pc.green(`-${totalRatio}%`);
  const bandwidthText = `${bandwidthRaw} / ${bandwidthRatio}`;

  config.logger.info(`
    ${BUILD_SHARP_PLUGIN_NAME} output:

    Total Size: ${totalOldSize.toFixed(2)}kb
    Total Compressed Size: ${totalCompressedSize.toFixed(2)}kb

    Total Bandwidth Save: ${bandwidthText}
  `);
}
