/**
 * useForm Hook
 *
 * A hook for handling form state and validation.
 */

import { useState, useCallback, useMemo } from "react";

function useForm(initialValues = {}, options = {}) {
  const { validate, onSubmit } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set a single field value
  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when value changes
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Handle input change
  const handleChange = useCallback(
    (nameOrEvent, value) => {
      // Support both (name, value) and (event) signatures
      if (typeof nameOrEvent === "string") {
        setValue(nameOrEvent, value);
      } else {
        const { name, value: eventValue, type, checked } = nameOrEvent.target;
        setValue(name, type === "checkbox" ? checked : eventValue);
      }
    },
    [setValue]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (nameOrEvent) => {
      const name = typeof nameOrEvent === "string" ? nameOrEvent : nameOrEvent.target.name;

      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate single field on blur
      if (validate) {
        const fieldErrors = validate({ ...values });
        if (fieldErrors[name]) {
          setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
        }
      }
    },
    [values, validate]
  );

  // Set multiple values at once
  const setMultipleValues = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validate) return true;

    const newErrors = validate(values);
    setErrors(newErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    return Object.keys(newErrors).length === 0;
  }, [values, validate]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      const isValid = validateForm();
      if (!isValid) return false;

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
          return true;
        } catch (err) {
          // Handle submission errors
          if (err.fieldErrors) {
            setErrors(err.fieldErrors);
          }
          throw err;
        } finally {
          setIsSubmitting(false);
        }
      }

      return true;
    },
    [values, validateForm, onSubmit]
  );

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => {
    if (!validate) return true;
    const currentErrors = validate(values);
    return Object.keys(currentErrors).length === 0;
  }, [values, validate]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Get field props helper
  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && Boolean(errors[name]),
      helperText: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues: setMultipleValues,
    setErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    reset,
    getFieldProps,
  };
}

export default useForm;
