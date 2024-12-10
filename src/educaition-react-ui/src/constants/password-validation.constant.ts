import { string } from "yup";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;
const PASSWORD_REGEX_PATTERN = String.raw`(?=^.{${MIN_PASSWORD_LENGTH},}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).*$`;

export const PasswordValidationRules = {
  validations: {
    "validation:rules.password.short": {
      count: MIN_PASSWORD_LENGTH,
    },
    "validation:rules.password.long": {
      count: MAX_PASSWORD_LENGTH,
    },
  },
  schema: string()
    .min(MIN_PASSWORD_LENGTH, "validation:rules.password.short")
    .max(MAX_PASSWORD_LENGTH, "validation:rules.password.long")
    .matches(
      new RegExp(PASSWORD_REGEX_PATTERN, "g"),
      "validation:rules.password.regex",
    )
    .required("validation:rules.password.required"),
};
