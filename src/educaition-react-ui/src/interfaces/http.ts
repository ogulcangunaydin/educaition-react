export type HttpExtraOptions = Partial<{
  notification: Partial<{
    /*
     * Default {3000ms}. Automatic close time of the notification
     * */
    autoClose: number;
    /*
     * Default {true}. Automatically shows error notification message if request returns error.
     * */
    autoHandleError: boolean;
    /*
     * Default {true} except GET method. Automatically shows success notification message if request returns success.
     * */
    autoHandleSuccess: boolean;
    /*
     * Default {http.title.common.error}. Http notification error/success translation title key.
     *
     * @example
     *```
     * extraOptions: createHttpExtraOptions({
     *   notification: {
     *     translationTitleKey: 'mySpecificTitleKeyFromAnotherNamespace',
     *   },
     * }),
     * ```
     *
     *```
     * extraOptions: createHttpExtraOptions({
     *   notification: {
     *     translationTitleKey: 'mySpecificTitleKeyFromAnotherNamespaceWithStatusInterpolation.{{status}}',
     *   },
     * }),
     * ```
     * */
    translationTitleKey: string;
    /*
     * Default {http.message.common.error}. Http notification error/success translation message key.
     *
     * @example
     *```
     * extraOptions: createHttpExtraOptions({
     *   notification: {
     *     translationMessageKey: 'mySpecificMessageKeyFromAnotherNamespace',
     *   },
     * }),
     * ```
     *
     *```
     * extraOptions: createHttpExtraOptions({
     *   notification: {
     *     translationMessageKey: 'mySpecificMessageKeyFromAnotherNamespaceWithStatusInterpolation.{{status}}',
     *   },
     * }),
     * ```
     * */
    translationMessageKey: string;
  }>;
}>;

export type HttpBaseRequest<Payload> = Payload & {
  extraOptions?: HttpExtraOptions;
};
