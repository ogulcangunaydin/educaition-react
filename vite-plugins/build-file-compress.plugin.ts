import compress from 'vite-plugin-compression';

interface BuildFileCompressPluginOptions {
  enabled: boolean;
}

export function BuildFileCompressPlugin({ enabled }: BuildFileCompressPluginOptions) {
  if (!enabled) {
    return null;
  }
  return [
    compress({
      algorithm: 'gzip',
      verbose: false,
    }),
    compress({
      algorithm: 'brotliCompress',
      verbose: false,
    }),
  ];
}
