import { XCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { MediaServerType } from '../../../server/constants/server';
import useSettings from '../../hooks/useSettings';
import { useUser } from '../../hooks/useUser';
import Accordion from '../Common/Accordion';
import ImageFader from '../Common/ImageFader';
import PageTitle from '../Common/PageTitle';
import LanguagePicker from '../Layout/LanguagePicker';
import PlexLoginButton from '../PlexLoginButton';
import Transition from '../Transition';
import JellyfinLogin from './JellyfinLogin';
import LocalLogin from './LocalLogin';
import getConfig from 'next/config';

const messages = defineMessages({
  signin: 'Sign In',
  signinheader: 'Sign in to continue',
  signinwithplex: 'Use your Plex account',
  signinwithjellyfin: 'Use your {mediaServerName} account',
  signinwithoverseerr: 'Use your {applicationTitle} account',
});

const Login: React.FC = () => {
  const intl = useIntl();
  const [error, setError] = useState('');
  const [isProcessing, setProcessing] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const { user, revalidate } = useUser();
  const router = useRouter();
  const settings = useSettings();
  const { publicRuntimeConfig } = getConfig();

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to sign in. If we get a success message, we will
  // ask swr to revalidate the user which _should_ come back with a valid user.
  useEffect(() => {
    const login = async () => {
      setProcessing(true);
      try {
        const response = await axios.post('/api/v1/auth/plex', { authToken });

        if (response.data?.id) {
          revalidate();
        }
      } catch (e) {
        setError(e.response.data.message);
        setAuthToken(undefined);
        setProcessing(false);
      }
    };
    if (authToken) {
      login();
    }
  }, [authToken, revalidate]);

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
            <Transition
              show={!!error}
              enter="opacity-0 transition duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="opacity-100 transition duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="mb-4 rounded-md bg-red-600 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-300" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-300">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            </Transition>
            <Accordion single atLeastOne>
              {({ openIndexes, handleClick, AccordionContent }) => (
                <>
                  <button
                    className={`w-full cursor-default bg-gray-800 bg-opacity-70 py-2 text-center text-sm font-bold text-gray-400 transition-colors duration-200 focus:outline-none sm:rounded-t-lg ${
                      openIndexes.includes(0) && 'text-indigo-500'
                    } ${
                      settings.currentSettings.localLogin &&
                      'hover:cursor-pointer hover:bg-gray-700'
                    }`}
                    onClick={() => handleClick(0)}
                    disabled={!settings.currentSettings.localLogin}
                  >
                    {settings.currentSettings.mediaServerType ==
                    MediaServerType.PLEX
                      ? intl.formatMessage(messages.signinwithplex)
                      : intl.formatMessage(messages.signinwithjellyfin, {
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
                        <PlexLoginButton
                          isProcessing={isProcessing}
                          onAuthToken={(authToken) => setAuthToken(authToken)}
                        />
                      ) : (
                        <JellyfinLogin revalidate={revalidate} />
                      )}
                    </div>
                  </AccordionContent>
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
                        {intl.formatMessage(messages.signinwithoverseerr, {
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
          </>
        </div>
      </div>
    </div>
  );
};

export default Login;
