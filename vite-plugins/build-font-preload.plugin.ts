import { load } from 'cheerio';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import type { PluginOption } from 'vite';

interface BuildFontPreloadPluginOptions {
  enabled: boolean;
}

export function BuildFontPreloadPlugin({ enabled }: BuildFontPreloadPluginOptions) {
  if (!enabled) {
    return null;
  }

  let outputPath = '';

  return {
    name: 'vite:build-font-preload',
    enforce: 'post',
    apply: 'build',
    configResolved({ build: { outDir } }) {
      outputPath = path.resolve(outDir);
    },
    async closeBundle() {
      const content = fs.readFileSync(outputPath + '/index.html');
      const fontFilePaths = glob
        .sync(`${outputPath}/assets/*.{woff,woff2}`)
        .filter((filePath) => /poppins-latin-[4|5|6|7]00/.test(filePath));

      const $ = load(content);
      const titleEl = $('head title');

      for (const filePath of fontFilePaths) {
        const name = filePath.split('/').pop();
        const ext = name.split('.').pop();
        const preloadLink = `
          <link rel="preload" href="/assets/${name}" as="font" type="font/${ext}" crossorigin="anonymous">
        `;

        $(preloadLink).insertBefore(titleEl);
      }

      fs.writeFileSync(outputPath + '/index.html', $.html());
    },
  } as PluginOption;
}
