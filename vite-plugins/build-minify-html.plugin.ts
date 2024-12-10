import fs from 'fs';
import { minify } from 'html-minifier-terser';
import path from 'path';
import type { PluginOption } from 'vite';

interface BuildMinifyHtmlPluginOptions {
  enabled: boolean;
}

export function BuildMinifyHtmlPlugin({ enabled }: BuildMinifyHtmlPluginOptions) {
  if (!enabled) {
    return null;
  }

  let outputPath = '';

  return {
    name: 'vite:build-minify-html',
    enforce: 'post',
    apply: 'build',
    configResolved({ build: { outDir } }) {
      outputPath = path.resolve(outDir);
    },
    async closeBundle() {
      const content = fs.readFileSync(outputPath + '/index.html');

      const minified = await minify(content.toString(), {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeAttributeQuotes: false,
        removeComments: true,
        removeEmptyAttributes: true,
      });

      fs.writeFileSync(outputPath + '/index.html', minified);
    },
  } as PluginOption;
}
