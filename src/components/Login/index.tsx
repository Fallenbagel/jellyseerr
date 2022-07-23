import getConfig from 'next/config';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { MediaServerType } from '../../../server/constants/server';
import useSettings from '../../hooks/useSettings';
import { useUser } from '../../hooks/useUser';
import Accordion from '../Common/Accordion';
import ImageFader from '../Common/ImageFader';
import LoadingSpinner from '../Common/LoadingSpinner';
import PageTitle from '../Common/PageTitle';
import LanguagePicker from '../Layout/LanguagePicker';
import ErrorCallout from './ErrorCallout';
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

const Login: React.FC = () => {
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

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-900 py-14">
      <PageTitle title={intl.formatMessage(messages.signin)} />
      <ImageFader
        backgroundImages={
          backdrops?.map(
            (backdrop) => `https://www.themoviedb.org/t/p/original${backdrop}`
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
          className="bg-gray-800 bg-opacity-50 shadow sm:rounded-lg"
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
                    <button
                      className={`w-full cursor-default bg-gray-800 bg-opacity-70 py-2 text-center text-sm font-bold text-gray-400 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-700 focus:outline-none sm:rounded-t-lg ${
                        openIndexes.includes(0) && 'text-indigo-500'
                      }`}
                      onClick={() => handleClick(0)}
                    >
                      {settings.currentSettings.mediaServerType ==
                      MediaServerType.PLEX
                        ? intl.formatMessage(messages.useplexaccount)
                        : intl.formatMessage(messages.usejellyfinaccount, {
                            mediaServerName:
                              publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                                ? 'Emby'
                                : 'Jellyfin',
                          })}
                    </button>
                    <AccordionContent isOpen={openIndexes.includes(0)}>
                      <div className="px-10 py-8">
                        {settings.currentSettings.mediaServerType ==
                        MediaServerType.PLEX ? (
                          <PlexLogin
                            onAuthenticated={revalidate}
                            isProcessing={isProcessing}
                            setProcessing={setProcessing}
                            onError={(err) => setError(err)}
                          />
                        ) : (
                          <JellyfinLogin onAuthenticated={revalidate} />
                        )}
                      </div>
                    </AccordionContent>
                    {settings.currentSettings.oidcLogin && (
                      <div>
                        <button
                          className={`w-full cursor-default bg-gray-800 bg-opacity-70 py-2 text-center text-sm font-bold text-gray-400 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-700 focus:outline-none ${
                            openIndexes.includes(2)
                              ? 'text-indigo-500'
                              : 'sm:rounded-b-lg'
                          }`}
                          onClick={() => handleClick(2)}
                        >
                          {intl.formatMessage(messages.useoidcaccount, {
                            OIDCProvider:
                              settings.currentSettings.oidcProviderName,
                          })}
                        </button>
                        <AccordionContent isOpen={openIndexes.includes(2)}>
                          <div className="px-10 py-8">
                            <OidcLogin
                              revalidate={revalidate}
                              setError={setError}
                              isProcessing={isProcessing}
                              setProcessing={setProcessing}
                            />
                          </div>
                        </AccordionContent>
                      </div>
                    )}
                    {settings.currentSettings.localLogin && (
                      <div>
                        <button
                          className={`w-full cursor-default bg-gray-800 bg-opacity-70 py-2 text-center text-sm font-bold text-gray-400 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-700 focus:outline-none ${
                            openIndexes.includes(1)
                              ? 'text-indigo-500'
                              : 'sm:rounded-b-lg'
                          }`}
                          onClick={() => handleClick(1)}
                        >
                          {intl.formatMessage(messages.useoverseeerraccount, {
                            applicationTitle:
                              settings.currentSettings.applicationTitle,
                          })}
                        </button>
                        <AccordionContent isOpen={openIndexes.includes(1)}>
                          <div className="px-10 py-8">
                            <LocalLogin revalidate={revalidate} />
                          </div>
                        </AccordionContent>
                      </div>
                    )}
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
