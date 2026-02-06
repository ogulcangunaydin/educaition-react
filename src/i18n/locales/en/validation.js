/**
 * English - Validation Translations
 */

const validation = {
  validation: {
    required: "This field is required",
    minLength: "Must be at least {{min}} characters",
    maxLength: "Must be at most {{max}} characters",
    email: "Please enter a valid email address",
    phone: "Please enter a valid phone number",
    url: "Please enter a valid URL",
    number: "Please enter a valid number",
    integer: "Please enter a whole number",
    positive: "Must be a positive number",
    min: "Must be at least {{min}}",
    max: "Must be at most {{max}}",
    pattern: "Invalid format",
    match: "Fields do not match",
    unique: "This value is already taken",
    date: "Please enter a valid date",
    future: "Date must be in the future",
    past: "Date must be in the past",
    file: {
      required: "Please select a file",
      size: "File size must be less than {{size}}MB",
      type: "Invalid file type. Allowed: {{types}}",
    },
  },
};

export default validation;
