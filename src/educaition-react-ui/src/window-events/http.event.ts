import { useExternalEvents } from '@educaition-react/ui/hooks';
import { HttpExtraOptions } from '@educaition-react/ui/interfaces';
import { AxiosError, AxiosResponse } from 'axios';

export interface HttpEvent {
  extraOptions: HttpExtraOptions;
  meta: AxiosResponse | AxiosError;
}

export type HttpEventDispatcher = {
  dispatchHttpNotification(event: HttpEvent): void;
};

export const [useHttpEvents, createHttpEvent] = useExternalEvents<HttpEventDispatcher>('http-events');
