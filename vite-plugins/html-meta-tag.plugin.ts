import { HtmlTagDescriptor, IndexHtmlTransformResult, PluginOption } from 'vite';

export type HtmlMetaTagPluginConfig = Record<string, string | boolean>[];

export function HtmlMetaTagPlugin(config: HtmlMetaTagPluginConfig) {
  return {
    name: 'vite:html-meta-tag',
    transformIndexHtml() {
      const htmlResult = [] as HtmlTagDescriptor[];
      config.forEach((meta) => {
        htmlResult.push({
          tag: 'meta',
          injectTo: 'head-prepend',
          attrs: { ...meta },
        });
      });
      return htmlResult as IndexHtmlTransformResult;
    },
  } as PluginOption;
}
