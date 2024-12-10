/**
 * Input: buildMessage('example.{{interpolation}}', { interpolation: 'replaceWithMe' })
 * Output: example.replaceWithMe
 */
export function interpolate(
  message = "",
  options: Record<string, any> = {},
): string {
  return Object.keys(options).reduce(
    (acc, key) =>
      acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), options[key] || key),
    message,
  );
}

/**
 * Input: F1C85E
 * Output: #F1C85E
 */
export function ensureHexColor(value: string): string {
  if (!value || value.startsWith("#")) {
    return value;
  }
  return `#${value}`;
}
