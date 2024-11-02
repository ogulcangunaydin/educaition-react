import type { AxiosRequestConfig } from 'axios';
import { HttpExtraOptions } from './http';

export interface AxiosRequestConfigExtended extends Partial<AxiosRequestConfig> {
  extraOptions?: HttpExtraOptions;
}
