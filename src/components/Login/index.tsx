import Accordion from '@app/components/Common/Accordion';
import ImageFader from '@app/components/Common/ImageFader';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import LanguagePicker from '@app/components/Layout/LanguagePicker';
import ErrorCallout from '@app/components/Login/ErrorCallout';
import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import { MediaServerType } from '@server/constants/server';
import getConfig from 'next/config';
import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import JellyfinLogin from './JellyfinLogin';
import LocalLogin from './LocalLogin';
import OidcLogin from './OidcLogin';
import PlexLogin from './PlexLogin';

const messages = defineMessages({
  signin: 'Sign In',
  signinheader: 'Sign in to continue',
  useplexaccount: 'Use your Plex account',
  usejellyfinaccount: 'Use your {mediaServerName} account',
  useoverseeerraccount: 'Use your {applicationTitle} account',
  useoidcaccount: 'Use your {OIDCProvider} account',
  authprocessing: 'Authentication in progress...',
});

const Login = () => {
  const intl = useIntl();
  const [error, setError] = useState('');
  const [isProcessing, setProcessing] = useState(false);
  const { user, revalidate } = useUser();
  const router = useRouter();
  const settings = useSettings();
  const { publicRuntimeConfig } = getConfig();

  // Effect that is triggered whenever `useUser`'s user changes. If we get a new
  // valid user, we redirect the user to the home page as the login was successful.
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const { data: backdrops } = useSWR<string[]>('/api/v1/backdrops', {
    refreshInterval: 0,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
  });

  const loginSections = [
    {
      // Media Server Login
      title:
        settings.currentSettings.mediaServerType == MediaServerType.PLEX
          ? intl.formatMessage(messages.useplexaccount)
          : intl.formatMessage(messages.usejellyfinaccount, {
              mediaServerName:
                publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                  ? 'Emby'
                  : 'Jellyfin',
            }),
      enabled: settings.currentSettings.mediaServerLogin,
      content:
        settings.currentSettings.mediaServerType == MediaServerType.PLEX ? (
          <PlexLogin
            onAuthenticated={revalidate}
            isProcessing={isProcessing}
            setProcessing={setProcessing}
            onError={(err) => setError(err)}
          />
        ) : (
          <JellyfinLogin onAuthenticated={revalidate} />
        ),
    },
    {
      // Local Login
      title: intl.formatMessage(messages.useoverseeerraccount, {
        applicationTitle: settings.currentSettings.applicationTitle,
      }),
      enabled: settings.currentSettings.localLogin,
      content: <LocalLogin revalidate={revalidate} />,
    },
    {
      // OIDC Login
      title: intl.formatMessage(messages.useoidcaccount, {
        OIDCProvider: settings.currentSettings.oidcProviderName,
      }),
      enabled: settings.currentSettings.oidcLogin,
      content: (
        <OidcLogin
          revalidate={revalidate}
          hasError={error !== ''}
          onError={setError}
          isProcessing={isProcessing}
          setProcessing={setProcessing}
        />
      ),
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-900 py-14">
      <PageTitle title={intl.formatMessage(messages.signin)} />
      <ImageFader
        backgroundImages={
          backdrops?.map(
            (backdrop) => `https://image.tmdb.org/t/p/original${backdrop}`
          ) ?? []
        }
      />
      <div className="absolute top-4 right-4 z-50">
        <LanguagePicker />
      </div>
      <div className="relative z-40 mt-10 flex flex-col items-center px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <img src="/logo_stacked.svg" className="mb-10 max-w-full" alt="Logo" />
        <h2 className="mt-2 text-center text-3xl font-extrabold leading-9 text-gray-100">
          {intl.formatMessage(messages.signinheader)}
        </h2>
      </div>
      <div className="relative z-50 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className="overflow-hidden bg-gray-800 bg-opacity-50 shadow sm:rounded-lg"
          style={{ backdropFilter: 'blur(5px)' }}
        >
          <>
            <ErrorCallout error={error} />
            {isProcessing ? (
              <div className="px-10 py-8">
                <h3 className="text-center text-xl font-semibold text-gray-400">
                  {intl.formatMessage(messages.authprocessing)}
                </h3>
                <LoadingSpinner />
              </div>
            ) : (
              <Accordion single atLeastOne>
                {({ openIndexes, handleClick, AccordionContent }) => (
                  <>
                    {loginSections
                      .filter((section) => section.enabled)
                      .map((section, i) => (
                        <div key={i}>
                          <button
                            className={`w-full cursor-default bg-gray-800 bg-opacity-70 py-2 text-center text-sm font-bold text-gray-400 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-700 focus:outline-none ${
                              openIndexes.includes(i) && 'text-indigo-500'
                            }`}
                            onClick={() => handleClick(i)}
                          >
                            {section.title}
                          </button>
                          <AccordionContent isOpen={openIndexes.includes(i)}>
                            <div className="px-10 py-8">{section.content}</div>
                          </AccordionContent>
                        </div>
                      ))}
                  </>
                )}
              </Accordion>
            )}
          </>
        </div>
      </div>
    </div>
  );
};

export default Login;
