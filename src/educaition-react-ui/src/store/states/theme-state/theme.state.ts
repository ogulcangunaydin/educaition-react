// src/store/theme/themeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThemeStateType } from "@educaition-react/ui/interfaces";

const initialState: ThemeStateType = {
  theme: "light", // Default theme
};

export const ThemeState = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { setTheme, toggleTheme } = ThemeState.actions;
export default ThemeState.reducer;
