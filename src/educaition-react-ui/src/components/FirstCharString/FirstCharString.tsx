import { useMemo } from "react";

interface FirstCharStringProps {
  /**
    Shows defaultValue if there is no value passed
    */
  defaultValue?: string;
  /**
    Shows first character of the value as uppercase
    */
  uppercase?: boolean;
  /**
    Shows first character of the value
    */
  value: string;
}

/**
- Shows the first character of the passed word.
**/
export function FirstCharString({
  defaultValue,
  uppercase = false,
  value,
}: FirstCharStringProps) {
  if (!value) {
    return defaultValue ? <>{defaultValue}</> : null;
  }

  const char = useMemo(() => {
    const val = value.charAt(0);
    return uppercase ? val.toUpperCase() : val;
  }, [value, uppercase]);

  return <>{char}</>;
}
