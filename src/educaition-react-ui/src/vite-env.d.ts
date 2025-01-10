/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/*
  Vite related typings.
  For example if some value comes from vite.config.ts via plugin etc..., you should include typing from this file
*/

interface ImportMetaEnv {
  // Add typings for .env variables, but we won't use that for this project. We load env variables at runtime via public/config.js
  // readonly VITE_API_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Check ./vite-types folder
declare const __PSN_BUILD_INFO__: ViteBuildInfo;
