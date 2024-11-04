import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { DatesProvider, DatesProviderSettings } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useTranslation } from 'react-i18next';
import { IntlProvider } from 'react-intl';

import { EDUCAITION_LIGHT_THEME, EDUCAITION_DARK_THEME, NOTIFICATION_CONTAINER_MAX_WIDTH } from '@educaition-react/theme';
import { store, persistor, RootState } from '@educaition-react/ui/store';
import { initializeI18n, DEFAULT_LANG } from '@educaition-react/ui/i18n';
import { TimeConstant } from '@educaition-react/ui/constants';
import { ModalCancel } from '@educaition-react/ui/components';

function MantineProviders({ children }: React.PropsWithChildren) {
  const { i18n } = useTranslation();
  const theme = useSelector((state: RootState) => state.theme.theme);

  const datesProviderSettings: DatesProviderSettings = useMemo(
    () => ({
      locale: i18n.language,
    }),
    [i18n.language],
  );

  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider theme={theme === 'light' ? EDUCAITION_LIGHT_THEME : EDUCAITION_DARK_THEME} withCssVariables>
        <ModalsProvider
          modalProps={{
            centered: true,
          }}
          modals={{
            cancel: ModalCancel,
          }}
        >
          <DatesProvider settings={datesProviderSettings}>
            <Notifications
              position="top-right"
              containerWidth={NOTIFICATION_CONTAINER_MAX_WIDTH}
              autoClose={TimeConstant.NOTIFICATION_AUTO_CLOSE_DURATION}
            />
            {children}
          </DatesProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}

function Providers({ children }: React.PropsWithChildren) {
  const { i18n } = useTranslation();

  return (
    <MantineProviders>
      <IntlProvider locale={i18n.language} key={i18n.language} defaultLocale={DEFAULT_LANG}>
        {children}
      </IntlProvider>
    </MantineProviders>
  );
}

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