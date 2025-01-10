import { createApi } from "@reduxjs/toolkit/query/react";
import { Language } from "@educaition-react/ui/interfaces";
import { HttpMethod } from "@educaition-react/ui/enums";
import { axiosBaseQuery } from "./base.service";

export const LanguagesService = createApi({
  reducerPath: "LanguagesService",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    languages: builder.query<Language[], void>({
      query: () => ({
        url: "/languages",
        method: HttpMethod.GET,
      }),
    }),
  }),
});

export const { useLanguagesQuery } = LanguagesService;
