import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export function useRouteQueryParamValidation(
  requiredQueryParams: string | string[],
) {
  const [params] = useSearchParams();

  return useMemo(() => {
    const query = Array.isArray(requiredQueryParams)
      ? requiredQueryParams
      : [requiredQueryParams];
    if (requiredQueryParams && !query.length) {
      throw new Error(
        'Please provide "requiredQueryParams" or remove the prop. Check route configuration.',
      );
    }
    return query.every((q) => !!params.get(q));
  }, [requiredQueryParams]);
}
