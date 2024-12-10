import { NotificationData } from "@mantine/notifications";
import { NotificationType } from "@educaition-react/theme";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@educaition-react/ui/components";
import { HttpExtraOptions } from "@educaition-react/ui/interfaces";
import { interpolate, deepMerge } from "@educaition-react/ui/utils";
import { HttpEvent, useHttpEvents } from "@educaition-react/ui/window-events";
import { AxiosError, AxiosResponse, HttpStatusCode } from "axios";
import { useTranslation } from "react-i18next";

export function HttpNotificationEventManager(): JSX.Element {
  const { i18n, t } = useTranslation("http");

  function showMessage(
    title: string,
    message: string,
    type: NotificationType,
    autoClose: number,
  ) {
    const options: NotificationData = {
      id: `http-event-message-${message}`,
      title,
      message,
      autoClose,
    };
    if (type === "error") {
      showErrorNotification(options);
    } else {
      showSuccessNotification(options);
    }
  }

  function showErrorMessage(title: string, message: string, autoClose: number) {
    showMessage(title, message, "error", autoClose);
  }

  function showSuccessMessage(
    title: string,
    message: string,
    autoClose: number,
  ) {
    showMessage(title, message, "success", autoClose);
  }

  function isResponseSuccess(status: number) {
    return status === HttpStatusCode.Ok;
  }

  function getDefaultExtraOptions(
    method: string,
    success: boolean,
  ): HttpExtraOptions {
    // Request POST, PUT ise error ve success default açık
    // Request GET ise error default açık, success kapalı
    return {
      notification: {
        autoClose: 3000,
        autoHandleError: true,
        autoHandleSuccess: method.toUpperCase() !== "GET",
        translationTitleKey: `http.title.common.${success ? "success" : "error"}`,
        translationMessageKey: `http.message.common.${success ? "success" : "error"}`,
      },
    };
  }

  function handleResponse(event: HttpEvent) {
    const { meta, extraOptions } = event;

    const {
      code,
      config: { method },
      data,
      status,
      response,
    } = meta as AxiosResponse & AxiosError;
    const isError = status === undefined; // AxiosError

    function getResStatus() {
      if (code === "ERR_NETWORK") {
        return HttpStatusCode.RequestTimeout;
      }
      if (isError) {
        return response?.status;
      }
      return status;
    }

    const resStatus = getResStatus() ?? 500;
    const success = isResponseSuccess(resStatus);
    const {
      notification: {
        translationTitleKey: defaultTitleKey,
        translationMessageKey: defaultMessageKey,
      } = {},
    } = getDefaultExtraOptions(method ?? "GET", success);

    const {
      notification: {
        autoClose = 3000,
        autoHandleError = true,
        autoHandleSuccess = true,
        translationTitleKey = defaultTitleKey,
        translationMessageKey = defaultMessageKey,
      } = {},
    } = deepMerge(
      getDefaultExtraOptions(method ?? "GET", success),
      extraOptions,
    );

    const res = isError ? response?.data : data;
    const titleKey = interpolate(res ? translationTitleKey : defaultTitleKey, {
      status: resStatus,
    });
    const messageKey = interpolate(
      res ? translationMessageKey : defaultMessageKey,
      {
        status: resStatus,
      },
    );

    const title = i18n.exists(titleKey, {
      ns: "http",
    })
      ? t(titleKey)
      : t(defaultTitleKey ?? "http.title.common.error");
    const message = i18n.exists(messageKey, {
      ns: "http",
    })
      ? t(messageKey)
      : t(defaultMessageKey ?? "http.message.common.error");

    if (autoHandleSuccess && success) {
      showSuccessMessage(title, message, autoClose);
    } else if (autoHandleError && !success) {
      showErrorMessage(title, message, autoClose);
    }
  }

  useHttpEvents({
    dispatchHttpNotification: handleResponse,
  });

  return <></>;
}
