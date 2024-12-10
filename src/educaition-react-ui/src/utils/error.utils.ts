import i18n from "@educaition-react/ui/i18n";
import { Nullable } from "@educaition-react/ui/interfaces";
import {
  FormikErrors,
  FormikProps,
  FormikTouched,
  FormikValues,
  getIn,
} from "formik";

/*
 * <TextInput
 *   error={translateErrorMessage(formik, 'phone', {
 *     'validation:rules.generic.min': {
 *        count: 5
 *      }
 *   })}
 * />
 * */
export function translateErrorMessage<T = FormikValues>(
  formik:
    | FormikProps<T>
    | {
        errors: FormikErrors<T>;
        touched: FormikTouched<T>;
      },
  key: keyof T | string,
  options?: Record<string, any>, // for i18n dynamic interpolation
): Nullable<string> {
  const error = getIn(formik.errors, key as string);
  const touch = getIn(formik.touched, key as string);
  if (error && touch) {
    const interpolation = (options &&
      options[formik.errors[key] as any]) as Record<string, any>;
    return i18n.t(error, {
      ns: ["validation", "translation"],
      ...options,
      ...interpolation,
    });
  }

  return null;
}

export function formikHasError<T = FormikValues>(
  formik: FormikProps<T>,
  key: keyof T,
): boolean {
  const error = getIn(formik.errors, key as string);
  const touch = getIn(formik.touched, key as string);

  return !!(error && touch);
}

export function formikHasAnyError<T = FormikValues>(
  formik: FormikProps<T>,
  key: keyof T | Array<keyof T>,
): boolean {
  const keys = Array.isArray(key) ? key : [key];
  return keys.some((k) => formikHasError(formik, k));
}

export function formikIsTouched<T = FormikValues>(
  formik: FormikProps<T>,
): boolean {
  return Object.keys(formik.touched).length > 0;
}
