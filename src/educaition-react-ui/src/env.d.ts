// env.d.ts

export {}; // This is a module declaration file, so it needs content to be a module.

/*
  Browser, window or package related typings.
*/

declare module "redux-persist-transform-filter" {
  import { Transform } from "redux-persist";

  /*
   * Fix the typings for 'redux-persist-transform-filter'
   */
  export function createFilter<HSS, ESS, State, Raw>(
    reducerName: string,
    inboundPaths?: string[],
    outboundPaths?: string[],
    transformType?: TransformType,
  ): Transform<HSS, ESS, State, Raw>;
}

// Environment interface
export interface Environment {
  API_URL: string;
}

// Global declarations
declare global {
  interface Window {
    __EDUCAITION_ENV__: Environment;
    // Extend window object if needed
  }

  namespace JSX {
    interface IntrinsicElements {
      // Extend JSX intrinsic elements if needed
    }
  }
}

// Example module declaration for image files
declare module "*.png";
