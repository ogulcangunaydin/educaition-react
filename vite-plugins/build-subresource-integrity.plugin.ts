import { load } from 'cheerio';
import { createHash } from 'crypto';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import type { PluginOption } from 'vite';

function generateIdentity(source: Buffer, alg: string) {
  const hash = createHash(alg).update(source).digest().toString('base64');
  return `${alg.toLowerCase()}-${hash}`;
}

interface BuildSubresourceIntegrityPluginOptions {
  enabled: boolean;
}

export function BuildSubresourceIntegrityPlugin({ enabled }: BuildSubresourceIntegrityPluginOptions) {
  if (!enabled) {
    return null;
  }

  let outputPath = '';

  return {
    name: 'vite:build-subresource-integrity',
    enforce: 'post',
    apply: 'build',
    configResolved({ build: { outDir } }) {
      outputPath = path.resolve(outDir);
    },
    async closeBundle() {
      const content = fs.readFileSync(outputPath + '/index.html');
      const selectors = ['script', 'link[rel=stylesheet]'];
      const crossorigin = 'anonymous';

      const $ = load(content);
      const elements = $(selectors.join()).get();

      for (const el of elements) {
        const url = $(el).attr('href') || $(el).attr('src');
        if (!url) {
          continue;
        }

        const isConfigFile = url.includes('config.js');
        if (isConfigFile) {
          continue;
        }

        let buf: Buffer;
        if (fs.existsSync(outputPath + '/' + url)) {
          buf = Buffer.from(fs.readFileSync(outputPath + '/' + url));
        } else if (url.startsWith('http')) {
          buf = await (await fetch(url)).buffer();
        } else {
          this.warn(`could not resolve resource "${url}"!`);
          continue;
        }

        const hash = generateIdentity(buf, 'sha384');

        $(el).attr('integrity', hash);
        $(el).attr('crossorigin', crossorigin);
      }

      fs.writeFileSync(outputPath + '/index.html', $.html());
    },
  } as PluginOption;
}
