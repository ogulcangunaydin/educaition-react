import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { LoginCard } from "@educaition-react/ui/components";
import { PasswordValidationRules } from "@educaition-react/ui/constants";
import { getRandomGreeting } from "@educaition-react/ui/pages/Login/login-greetings";
import { useLoginMutation } from "@educaition-react/ui/services";
import { translateErrorMessage } from "@educaition-react/ui/utils";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { object, string } from "yup";

export function LoginDefaultLayout() {
  const [loginRequest, { isLoading: isLoginLoading }] = useLoginMutation();
  const { t } = useTranslation(["translation", "validation", "routes"]);
  const [loginGreeting] = useState(() => getRandomGreeting());

  const loginValidationSchema = useMemo(
    () =>
      object()
        .shape({
          email: string()
            .email("validation:rules.email.invalid")
            .trim()
            .required("validation:rules.email.required"),
          password: PasswordValidationRules.schema,
        })
        .strict(),
    [],
  );

  const initialValues = useMemo(() => {
    return {
      email: "",
      password: "",
    };
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema: loginValidationSchema,
    onSubmit: ({ email, password }) => {
      loginRequest({ email, password }).unwrap();
    },
  });

  const loginBtnDisabledStatus = useMemo(() => {
    const isFormNotReady = !(formik.isValid && formik.dirty);

    return isLoginLoading || isFormNotReady;
  }, [formik, isLoginLoading]);

  return (
    <LoginCard
      title={loginGreeting.greeting}
      description={t("login.form.description")}
      titleChildren={
        <Tooltip
          label={t("login.form.greetingExplanation", {
            greeting: loginGreeting.greeting,
            language: t(`login.${loginGreeting.language}`),
          })}
        >
          <Text component="span" ml={10} fz={34} fw={700}>
            *
          </Text>
        </Tooltip>
      }
    >
      <form onSubmit={formik.handleSubmit} data-testid="section-login-form">
        <Stack>
          <Stack mb={50}>
            <Stack gap={12}>
              <TextInput
                data-testid="input-login-email"
                id="email"
                name="email"
                autoComplete="email"
                label={t("validation:email.label")}
                placeholder={t("validation:email.placeholder")}
                size="lg"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={translateErrorMessage(formik, "email")}
              ></TextInput>

              <PasswordInput
                data-testid="input-login-password"
                id="password"
                name="password"
                autoComplete="password"
                label={t("validation:password.label")}
                placeholder={t("validation:password.placeholder")}
                size="lg"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={translateErrorMessage(
                  formik,
                  "password",
                  PasswordValidationRules.validations,
                )}
              />
            </Stack>

            <Button
              size="xl"
              type="submit"
              loading={isLoginLoading}
              disabled={loginBtnDisabledStatus}
              data-testid="button-login-submit"
            >
              {t("routes:login")}
            </Button>
          </Stack>
        </Stack>
      </form>
    </LoginCard>
  );
}
