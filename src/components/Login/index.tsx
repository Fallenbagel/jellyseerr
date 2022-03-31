import React, { useEffect, useState } from 'react';
import PlexLoginButton from '../PlexLoginButton';
import JellyfinLogin from './JellyfinLogin';
import { useUser } from '../../hooks/useUser';
import axios from 'axios';
import { useRouter } from 'next/dist/client/router';
import ImageFader from '../Common/ImageFader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Transition from '../Transition';
import LanguagePicker from '../Layout/LanguagePicker';
import LocalLogin from './LocalLogin';
import Accordion from '../Common/Accordion';
import useSettings from '../../hooks/useSettings';
import PageTitle from '../Common/PageTitle';
import { MediaServerType } from '../../../server/constants/server';

const messages = defineMessages({
  signin: 'Sign In',
  signinheader: 'Sign in to continue',
  signinwithplex: 'Use your Plex account',
  signinwithjellyfin: 'Use your Jellyfin account',
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

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-900 py-14">
      <PageTitle title={intl.formatMessage(messages.signin)} />
      <ImageFader
        backgroundImages={[
          '/images/rotate1.jpg',
          '/images/rotate2.jpg',
          '/images/rotate3.jpg',
          '/images/rotate4.jpg',
          '/images/rotate5.jpg',
          '/images/rotate6.jpg',
        ]}
      />
      <div className="absolute z-50 top-4 right-4">
        <LanguagePicker />
      </div>
      <div className="relative z-40 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <img src="/logo.png" className="w-auto mx-auto max-h-32" alt="Logo" />
        <h2 className="mt-2 text-3xl font-extrabold leading-9 text-center text-gray-100">
          <FormattedMessage {...messages.signinheader} />
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
              <div className="p-4 mb-4 bg-red-600 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-red-300"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                    className={`w-full py-2 text-sm text-center text-gray-400 transition-colors duration-200 bg-gray-800 cursor-default focus:outline-none bg-opacity-70 sm:rounded-t-lg ${
                      openIndexes.includes(0) && 'text-indigo-500'
                    } ${
                      settings.currentSettings.localLogin &&
                      'hover:bg-gray-700 hover:cursor-pointer'
                    }`}
                    onClick={() => handleClick(0)}
                    disabled={!settings.currentSettings.localLogin}
                  >
                    {settings.currentSettings.mediaServerType ==
                    MediaServerType.PLEX
                      ? intl.formatMessage(messages.signinwithplex)
                      : intl.formatMessage(messages.signinwithjellyfin)}
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
                        className={`w-full py-2 text-sm text-center text-gray-400 transition-colors duration-200 bg-gray-800 cursor-default focus:outline-none bg-opacity-70 hover:bg-gray-700 hover:cursor-pointer ${
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
