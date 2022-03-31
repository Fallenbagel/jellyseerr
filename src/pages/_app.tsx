import React, { useEffect, useState } from 'react';
import '../styles/globals.css';
import App, { AppInitialProps, AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ToastProvider } from 'react-toast-notifications';
import { parseCookies, setCookie } from 'nookies';
import Layout from '../components/Layout';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { User } from '../hooks/useUser';
import { IntlProvider } from 'react-intl';
import { LanguageContext, AvailableLocales } from '../context/LanguageContext';
import Head from 'next/head';
import Toast from '../components/Toast';
import { InteractionProvider } from '../context/InteractionContext';
import StatusChecker from '../components/StatusChacker';
import { PublicSettingsResponse } from '../../server/interfaces/api/settingsInterfaces';
import { SettingsProvider } from '../context/SettingsContext';
import { MediaServerType } from '../../server/constants/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadLocaleData = (locale: AvailableLocales): Promise<any> => {
  switch (locale) {
    case 'de':
      return import('../i18n/locale/de.json');
    case 'es':
      return import('../i18n/locale/es.json');
    case 'fr':
      return import('../i18n/locale/fr.json');
    case 'it':
      return import('../i18n/locale/it.json');
    case 'ja':
      return import('../i18n/locale/ja.json');
    case 'hu':
      return import('../i18n/locale/hu.json');
    case 'nb-NO':
      return import('../i18n/locale/nb_NO.json');
    case 'nl':
      return import('../i18n/locale/nl.json');
    case 'pt-BR':
      return import('../i18n/locale/pt_BR.json');
    case 'pt-PT':
      return import('../i18n/locale/pt_PT.json');
    case 'ru':
      return import('../i18n/locale/ru.json');
    case 'sr':
      return import('../i18n/locale/sr.json');
    case 'sv':
      return import('../i18n/locale/sv.json');
    case 'zh-TW':
      return import('../i18n/locale/zh_Hant.json');
    default:
      return import('../i18n/locale/en.json');
  }
};

// Custom types so we can correctly type our GetInitialProps function
// with our combined user prop
// This is specific to _app.tsx. Other pages will not need to do this!
type NextAppComponentType = typeof App;
type MessagesType = Record<string, any>;

interface ExtendedAppProps extends AppProps {
  user: User;
  messages: MessagesType;
  locale: AvailableLocales;
  currentSettings: PublicSettingsResponse;
}

if (typeof window === 'undefined') {
  global.Intl = require('intl');
}

const CoreApp: Omit<NextAppComponentType, 'origGetInitialProps'> = ({
  Component,
  pageProps,
  router,
  user,
  messages,
  locale,
  currentSettings,
}: ExtendedAppProps) => {
  let component: React.ReactNode;
  const [loadedMessages, setMessages] = useState<MessagesType>(messages);
  const [currentLocale, setLocale] = useState<AvailableLocales>(locale);

  useEffect(() => {
    loadLocaleData(currentLocale).then(setMessages);
    setCookie(null, 'locale', currentLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  }, [currentLocale]);

  if (router.pathname.match(/(login|setup|resetpassword)/)) {
    component = <Component {...pageProps} />;
  } else {
    component = (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }

  return (
    <SWRConfig
      value={{
        fetcher: (url) => axios.get(url).then((res) => res.data),
      }}
    >
      <LanguageContext.Provider value={{ locale: currentLocale, setLocale }}>
        <IntlProvider
          locale={currentLocale}
          defaultLocale="en"
          messages={loadedMessages}
        >
          <SettingsProvider currentSettings={currentSettings}>
            <InteractionProvider>
              <ToastProvider components={{ Toast }}>
                <Head>
                  <title>Overseerr</title>
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                  />
                </Head>
                <StatusChecker />
                <UserContext initialUser={user}>{component}</UserContext>
              </ToastProvider>
            </InteractionProvider>
          </SettingsProvider>
        </IntlProvider>
      </LanguageContext.Provider>
    </SWRConfig>
  );
};

CoreApp.getInitialProps = async (initialProps) => {
  const { ctx, router } = initialProps;
  let user = undefined;
  let currentSettings: PublicSettingsResponse = {
    initialized: false,
    applicationTitle: '',
    hideAvailable: false,
    movie4kEnabled: false,
    series4kEnabled: false,
    localLogin: true,
    region: '',
    originalLanguage: '',
    mediaServerType: MediaServerType.NOT_CONFIGURED,
  };

  let locale = 'en';

  if (ctx.res) {
    // Check if app is initialized and redirect if necessary
    const response = await axios.get<PublicSettingsResponse>(
      `http://localhost:${process.env.PORT || 5055}/api/v1/settings/public`
    );

    currentSettings = response.data;

    const initialized = response.data.initialized;

    if (!initialized) {
      if (!router.pathname.match(/(setup|login\/plex)/)) {
        ctx.res.writeHead(307, {
          Location: '/setup',
        });
        ctx.res.end();
      }
    } else {
      try {
        // Attempt to get the user by running a request to the local api
        const response = await axios.get<User>(
          `http://localhost:${process.env.PORT || 5055}/api/v1/auth/me`,
          { headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined }
        );
        user = response.data;

        if (router.pathname.match(/login/)) {
          ctx.res.writeHead(307, {
            Location: '/',
          });
          ctx.res.end();
        }
      } catch (e) {
        // If there is no user, and ctx.res is set (to check if we are on the server side)
        // _AND_ we are not already on the login or setup route, redirect to /login with a 307
        // before anything actually renders
        if (!router.pathname.match(/(login|setup|resetpassword)/)) {
          ctx.res.writeHead(307, {
            Location: '/login',
          });
          ctx.res.end();
        }
      }
    }

    const cookies = parseCookies(ctx);

    if (cookies.locale) {
      locale = cookies.locale;
    }
  }

  // Run the default getInitialProps for the main nextjs initialProps
  const appInitialProps: AppInitialProps = await App.getInitialProps(
    initialProps
  );

  const messages = await loadLocaleData(locale as AvailableLocales);

  return { ...appInitialProps, user, messages, locale, currentSettings };
};

export default CoreApp;
