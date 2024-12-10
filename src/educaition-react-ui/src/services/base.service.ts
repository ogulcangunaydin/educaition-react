import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { store } from "@educaition-react/ui/store";
import { ENV } from "@educaition-react/ui/utils";
import { AxiosRequestConfigExtended } from "@educaition-react/ui/interfaces";
import { createHttpEvent } from "@educaition-react/ui/window-events";

const dispatchNotificationHttpEvent = createHttpEvent(
  "dispatchHttpNotification",
);

export const axiosBaseQuery =
  (
    baseUrl = ENV.API_URL,
  ): BaseQueryFn<AxiosRequestConfigExtended, unknown, AxiosResponse> =>
  async ({ url, method, data, params, extraOptions }, { signal }) => {
    const { token } = store.getState().AuthState; // Adjust according to your state structure

    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        signal,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      dispatchNotificationHttpEvent({
        extraOptions: extraOptions || {},
        meta: result,
      });

      return { data: result.data, meta: result };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      dispatchNotificationHttpEvent({
        extraOptions: extraOptions || {},
        meta: err,
      });

      return {
        error: err.response || (err as unknown as AxiosResponse),
        meta: err,
      };
    }
  };
