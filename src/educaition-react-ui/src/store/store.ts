import {
  combineReducers,
  configureStore,
  PayloadAction,
} from "@reduxjs/toolkit";

import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";
import createFilter from "redux-persist-transform-filter";
import storage from "redux-persist/lib/storage";

import { AuthStateType } from "@educaition-react/ui/interfaces";
import { AuthState, LanguageState, ThemeState } from "./states";
import { AuthService } from "../services";
import { StateResetAction } from "./actions";
import { ListenerMiddleware } from "./middlewares";

const STATES = {
  AuthState,
  LanguageState,
  ThemeState,
};

const MIDDLEWARES = [AuthService.middleware];

const SERVICES = {
  [AuthService.reducerPath]: AuthService.reducer,
  [LanguageState.reducerPath]: LanguageState.reducer,
  [ThemeState.reducerPath]: ThemeState.reducer,
};

const REDUCERS = {
  AuthState: AuthState.reducer,
  LanguageState: LanguageState.reducer,
  ThemeState: ThemeState.reducer,
};

const COMBINED_REDUCERS = combineReducers({
  ...SERVICES,
  ...REDUCERS,
});

// Filter for persisting only specific parts of the auth state
const FilteredAuthState = createFilter<
  { token: string; id: number },
  AuthStateType,
  ReturnType<typeof COMBINED_REDUCERS>,
  ReturnType<typeof COMBINED_REDUCERS>
>(AuthState.name, ["token", "id"] as (keyof AuthStateType)[]);

// Configure persisted reducer
const persistedReducer = persistReducer(
  {
    key: "educaition",
    version: 1,
    storage,
    whitelist: [AuthState.name],
    transforms: [FilteredAuthState],
  },
  COMBINED_REDUCERS,
);

// Root reducer with state reset functionality
const rootReducer = (state: any, action: PayloadAction<any>) => {
  if (action.type === StateResetAction.type) {
    const stateKey = action.payload as keyof typeof STATES;
    return persistedReducer(
      {
        ...state,
        [stateKey]: STATES[stateKey].getInitialState(),
      },
      action,
    );
  }
  return persistedReducer(state, action);
};

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .prepend(ListenerMiddleware.middleware)
      .concat(MIDDLEWARES),
});

// Configure persistor
export const persistor = persistStore(store);

// Type definitions
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type StateKeys = keyof typeof STATES;

// Setup listeners
setupListeners(store.dispatch);
