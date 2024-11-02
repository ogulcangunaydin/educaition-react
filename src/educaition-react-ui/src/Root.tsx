import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { DatesProvider, DatesProviderSettings } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useTranslation } from 'react-i18next';
import { IntlProvider } from 'react-intl';
import { store, persistor } from './store'; // Import your Redux store and persistor
import { initializeI18n, DEFAULT_LANG } from './i18n'; // Adjusted path

const MantineProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  const datesProviderSettings: DatesProviderSettings = useMemo(
    () => ({
      locale: i18n.language,
    }),
    [i18n.language],
  );

  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider defaultColorScheme="light" withCssVariables>
        <ModalsProvider>
          <DatesProvider settings={datesProviderSettings}>
            <Notifications position="top-right" />
            {children}
          </DatesProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
};

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  return (
    <MantineProviders>
      <IntlProvider locale={i18n.language} key={i18n.language} defaultLocale={DEFAULT_LANG}>
        {children}
      </IntlProvider>
    </MantineProviders>
  );
};

const ReduxProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>{children}</PersistGate>
    </ReduxProvider>
  );
};

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    initializeI18n();
  }, []);

  return <>{children}</>;
};

export const render = (App: React.FC) => {
  const container = document.getElementById('root');
  const root = createRoot(container!); // Create a root.

  root.render(
    <React.StrictMode>
      <ReduxProviders>
        <Providers>
          <Root>
            <App />
          </Root>
        </Providers>
      </ReduxProviders>
    </React.StrictMode>
  );
};

export default Root;
