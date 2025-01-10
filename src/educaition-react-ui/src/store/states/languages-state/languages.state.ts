import { createSlice } from "@reduxjs/toolkit";
import { Language } from "@educaition-react/ui/interfaces";
import { LanguagesService } from "@educaition-react/ui/services";

export interface LanguagesStateType {
  languages: Language[];
}

const initialState: LanguagesStateType = {
  languages: [],
};

export const LanguagesState = createSlice({
  name: "LanguagesState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      LanguagesService.endpoints.languages.matchFulfilled,
      (state, { payload }) => {
        state.languages = payload;
      },
    );
  },
});
