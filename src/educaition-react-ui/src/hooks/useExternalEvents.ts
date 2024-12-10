import { useLayoutEffect } from "react";

function dispatchEvent<T>(type: string, detail?: T) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

function createEventListenerKey(prefix: string, eventKey: string) {
  // prefix events with 'edc-' just to be sure we don't conflict with any other event listener names
  return `edc-${prefix}:${eventKey}`;
}

export function useExternalEvents<
  Handlers extends Record<string, (detail: any) => void>,
>(prefix: string) {
  function _useExternalEvents(events: Handlers) {
    const handlers = Object.keys(events).reduce((acc, eventKey) => {
      const key = createEventListenerKey(prefix, eventKey);
      acc[key] = (event: CustomEvent) => events[eventKey](event.detail);
      return acc;
    }, {} as any);

    useLayoutEffect(() => {
      Object.keys(handlers).forEach((eventKey) => {
        window.removeEventListener(eventKey, handlers[eventKey]);
        window.addEventListener(eventKey, handlers[eventKey]);
      });

      return () =>
        Object.keys(handlers).forEach((eventKey) => {
          window.removeEventListener(eventKey, handlers[eventKey]);
        });
    }, [handlers]);
  }

  function createEvent<EventKey extends keyof Handlers>(event: EventKey) {
    type Parameter = Parameters<Handlers[EventKey]>[0];

    return (
      ...payload: Parameter extends undefined ? [undefined?] : [Parameter]
    ) => {
      const key = createEventListenerKey(prefix, String(event));
      dispatchEvent(key, payload[0]);
    };
  }

  return [_useExternalEvents, createEvent] as const;
}
