import esbuild from 'esbuild';
import path from 'path';
import { HtmlTagDescriptor, IndexHtmlTransformResult, PluginOption } from 'vite';

export function RuntimeConfigPlugin() {
  let outputPath = '';
  return {
    name: 'vite:runtime-config',
    configResolved({ build: { outDir } }) {
      outputPath = path.resolve(outDir);
    },
    transformIndexHtml() {
      const htmlResult = [] as HtmlTagDescriptor[];
      htmlResult.push({
        tag: 'base',
        injectTo: 'head-prepend',
        attrs: {
          href: '/',
        },
      });
      htmlResult.push({
        tag: 'script',
        injectTo: 'head-prepend',
        attrs: {
          src: `./config.js?v=${Date.now()}`,
        },
      });
      return htmlResult as IndexHtmlTransformResult;
    },
    closeBundle() {
      const configFile = path.join(outputPath, 'config.js');
      esbuild.buildSync({
        allowOverwrite: true,
        entryPoints: [configFile],
        minify: true,
        outfile: configFile,
      });
    },
  } as PluginOption;
}
