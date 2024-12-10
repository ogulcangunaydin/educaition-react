import ReactPlugin from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, PluginOption } from 'vite';
import Checker from 'vite-plugin-checker';
import SVGRPlugin from 'vite-plugin-svgr';
import TsConfigPathsPlugin from 'vite-tsconfig-paths';
import { MetaTagsConfig } from './vite-config';
import {
  BuildAnalyzePlugin,
  BuildFaviconPlugin,
  BuildFileCompressPlugin,
  BuildFontPreloadPlugin,
  BuildMinifyHtmlPlugin,
  BuildReactDevtoolsRemoverPlugin,
  BuildSharpPlugin,
  BuildSubresourceIntegrityPlugin,
  HtmlMetaTagPlugin,
  RuntimeConfigPlugin,
} from './vite-plugins';

function checkFlagIsEnabled(name: string): boolean {
  return process.env[name] === 'true';
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const PROD = mode === 'production';

  const buildPlugins: PluginOption[] = [
    BuildReactDevtoolsRemoverPlugin(),
    BuildAnalyzePlugin({
      enabled: checkFlagIsEnabled('FLAG_ANALYZE'),
    }),
    BuildFaviconPlugin('./logo.png'),
    BuildSharpPlugin({
      enabled: PROD,
    }),
    BuildFileCompressPlugin({
      enabled: PROD,
    }),
    BuildSubresourceIntegrityPlugin({
      enabled: PROD,
    }),
    BuildFontPreloadPlugin({
      enabled: PROD,
    }),
    BuildMinifyHtmlPlugin({
      enabled: PROD,
    }),
  ];

  const plugins: PluginOption[] = [
    ReactPlugin(),
    TsConfigPathsPlugin(),
    Checker({
      typescript: true,
      eslint: { useFlatConfig: true, lintCommand: 'eslint "src/**/*.{js,jsx,ts,tsx,json}"' },
    }),
    SVGRPlugin(),
    HtmlMetaTagPlugin(MetaTagsConfig),
    RuntimeConfigPlugin(),
  ];

  const generateScopedName = PROD ? '[hash:base64:7]' : '[local]_[hash:base64:7]';

  return {
    build: {
      chunkSizeWarningLimit: 1024 * 3,
      sourcemap: PROD,
      rollupOptions: {
        maxParallelFileOps: 40,
        output: {
          compact: true,
        },
      },
    },
    css: {
      devSourcemap: PROD,
      modules: {
        localsConvention: 'camelCase',
        generateScopedName,
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    esbuild: {
      drop: PROD ? ['debugger'] : [],
    },
    plugins: [...plugins, ...buildPlugins],
    server: {
      port: 8080,
      strictPort: true,
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'node_modules'),
        '@scss': path.resolve(__dirname, 'src', 'educaition-react-ui', 'src', 'styles'),
      },
    },
  };
});
