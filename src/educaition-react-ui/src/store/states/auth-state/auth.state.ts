import { createSlice } from "@reduxjs/toolkit";
// import { DEFAULT_PERMISSIONS, transformPermissions } from '@educaition-react/ui/constants';
import i18n, { SUPPORTED_LANGUAGES } from "@educaition-react/ui/i18n";
import { User, AuthStateType } from "@educaition-react/ui/interfaces";
import { AuthService } from "@educaition-react/ui/services";

function changeLanguageByUserLang(languageCode: string) {
  const userLanguage = languageCode.toLowerCase();
  const supported = SUPPORTED_LANGUAGES.some((lang) => lang === userLanguage);
  if (supported) {
    i18n.changeLanguage(userLanguage);
  }
}

function patchAuthentication(state: AuthStateType, payload: User) {
  state.id = payload.id;
  state.token = payload.token;
  state.user = payload;
  // TODO: Implement permissions in the future
  // state.permissions = transformPermissions(payload.permissions);
  changeLanguageByUserLang(payload.language);
}

const initialState: AuthStateType = {
  id: null,
  token: null,
  user: {} as User,
  // TODO: Implement permissions in the future
  // permissions: DEFAULT_PERMISSIONS,
};

export const AuthState = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutAction: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      AuthService.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        patchAuthentication(state, payload as User);
      },
    );
    builder.addMatcher(
      AuthService.endpoints.changePassword.matchFulfilled,
      (state, { payload }) => {
        patchAuthentication(state, payload as User);
      },
    );
    builder.addMatcher(
      AuthService.endpoints.uploadProfilePicture.matchFulfilled,
      (state, { payload }) => {
        state.user.avatar_color = payload.avatar_color;
      },
    );
    builder.addMatcher(
      AuthService.endpoints.deleteProfilePicture.matchFulfilled,
      (state, { payload }) => {
        state.user.avatar_color = payload.avatar_color;
      },
    );
  },
});

export const { logoutAction } = AuthState.actions;
