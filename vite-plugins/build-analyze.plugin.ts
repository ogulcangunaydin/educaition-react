import { visualizer } from 'rollup-plugin-visualizer';
import { PluginOption } from 'vite';

interface BuildAnalyzePluginConfig {
  enabled: boolean;
}

export function BuildAnalyzePlugin({ enabled }: BuildAnalyzePluginConfig) {
  if (enabled) {
    return visualizer({
      filename: './node_modules/.cache/visualizer/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }) as unknown as PluginOption;
  }
  return null;
}
