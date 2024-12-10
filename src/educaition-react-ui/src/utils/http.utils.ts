import { HttpExtraOptions } from "@educaition-react/ui/interfaces";
import { deepMerge } from "./object.utils";
// import { __DEV__ } from './dev.utils';

export function createHttpExtraOptions(
  options: HttpExtraOptions,
  override?: HttpExtraOptions,
): HttpExtraOptions {
  return deepMerge<HttpExtraOptions>(options, override);
}

// export function noop(values: any) {
//   // do nothing
//   if (__DEV__) {
//     console.log(values);
//   }
// }
