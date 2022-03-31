import React, { useEffect, useState } from 'react';
import { useUser } from '../../hooks/useUser';
import PlexLoginButton from '../PlexLoginButton';
import JellyfinLogin from '../Login/JellyfinLogin';
import axios from 'axios';
import { defineMessages, FormattedMessage } from 'react-intl';
import Accordion from '../Common/Accordion';
import { MediaServerType } from '../../../server/constants/server';

const messages = defineMessages({
  welcome: 'Welcome to Overseerr',
  signinMessage: 'Get started by signing in',
  signinWithJellyfin: 'Use your Jellyfin account',
  signinWithPlex: 'Use your Plex account',
});

interface LoginWithMediaServerProps {
  onComplete: () => void;
}

const SetupLogin: React.FC<LoginWithMediaServerProps> = ({ onComplete }) => {
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [mediaServerType, setMediaServerType] = useState<number>(
    MediaServerType.NOT_CONFIGURED
  );
  const { user, revalidate } = useUser();

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to login. If we get a success message, we will
  // ask swr to revalidate the user which _shouid_ come back with a valid user.

  useEffect(() => {
    const login = async () => {
      const response = await axios.post('/api/v1/auth/plex', {
        authToken: authToken,
      });

      if (response.data?.email) {
        revalidate();
      }
    };
    if (authToken && mediaServerType == MediaServerType.PLEX) {
      login();
    }
  }, [authToken, mediaServerType, revalidate]);

  useEffect(() => {
    if (user) {
      onComplete();
    }
  }, [user, onComplete]);

  return (
    <div>
      <div className="flex justify-center mb-2 text-xl font-bold">
        <FormattedMessage {...messages.welcome} />
      </div>
      <div className="flex justify-center pb-6 mb-2 text-sm">
        <FormattedMessage {...messages.signinMessage} />
      </div>
      <Accordion single atLeastOne>
        {({ openIndexes, handleClick, AccordionContent }) => (
          <>
            <button
              className={`w-full py-2 text-sm text-center hover:bg-gray-700 hover:cursor-pointer text-gray-400 transition-colors duration-200 bg-gray-900 cursor-default focus:outline-none sm:rounded-t-lg ${
                openIndexes.includes(0) && 'text-indigo-500'
              } ${openIndexes.includes(1) && 'border-b border-gray-500'}`}
              onClick={() => handleClick(0)}
            >
              <FormattedMessage {...messages.signinWithPlex} />
            </button>
            <AccordionContent isOpen={openIndexes.includes(0)}>
              <div
                className="px-10 py-8"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <PlexLoginButton
                  onAuthToken={(authToken) => {
                    setMediaServerType(MediaServerType.PLEX);
                    setAuthToken(authToken);
                  }}
                />
              </div>
            </AccordionContent>
            <div>
              <button
                className={`w-full py-2 text-sm text-center text-gray-400 transition-colors duration-200 bg-gray-900 cursor-default focus:outline-none hover:bg-gray-700 hover:cursor-pointer ${
                  openIndexes.includes(1)
                    ? 'text-indigo-500'
                    : 'sm:rounded-b-lg'
                }`}
                onClick={() => handleClick(1)}
              >
                <FormattedMessage {...messages.signinWithJellyfin} />
              </button>
              <AccordionContent isOpen={openIndexes.includes(1)}>
                <div
                  className="px-10 py-8 rounded-b-lg"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                  <JellyfinLogin initial={true} revalidate={revalidate} />
                </div>
              </AccordionContent>
            </div>
          </>
        )}
      </Accordion>
    </div>
  );
};

export default SetupLogin;
