import { PluginOption, ResolvedConfig } from 'vite';

export function BuildReactDevtoolsRemoverPlugin() {
  let config: ResolvedConfig;

  return {
    name: 'vite:build-react-devtools-remover',
    // Ensure that we resolve before everything else
    enforce: 'pre',
    // Run only on build
    apply: 'build',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml(code: string) {
      if (config.mode === 'production') {
        return {
          html: code,
          tags: [
            {
              injectTo: 'body',
              tag: 'script',
              children: `
                  function isFunction(obj) {
                    return typeof obj == 'function';
                  }
                  function isObject(obj) {
                    var type = typeof obj;
                    return type === 'function' || (type === 'object' && !!obj);
                  }
                  function removeReactDevTools() {
                    if (!isObject(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
                      return;
                    }
                    for (const prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                      if (prop === 'renderers') {
                        // prevents console error when dev tools try to iterate of renderers
                        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = new Map();
                        continue;
                      }
                      if (prop === 'backends') {
                        // prevents console error when dev tools try to iterate of backends
                        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = [];
                        continue;
                      }
                      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = isFunction(
                        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop]
                      )
                        ? Function.prototype
                        : null;
                    }
                  }
                  removeReactDevTools();
              `,
            },
          ],
        };
      }
      return code;
    },
  } as PluginOption;
}
