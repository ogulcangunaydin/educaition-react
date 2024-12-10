export function deepMerge<T>(target: T, source?: Partial<T>): T {
  if (typeof target !== "object" || target === null) {
    return source as T;
  }

  if (typeof source !== "object" || source === null) {
    return target;
  }

  const merged = { ...target } as T;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (Array.isArray(source[key])) {
        (merged as any)[key] = source[key];
      } else if (typeof source[key] === "object" && source[key] !== null) {
        (merged as any)[key] = deepMerge(
          (target as any)[key],
          source[key] as Partial<T>,
        );
      } else {
        (merged as any)[key] = source[key];
      }
    }
  }

  return merged;
}
