import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LanguageStateType } from '@educaition-react/ui/interfaces';

const initialState: LanguageStateType = {
  language: 'en',
};

export const LanguageState = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = LanguageState.actions;
