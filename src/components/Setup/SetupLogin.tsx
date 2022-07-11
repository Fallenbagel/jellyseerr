import getConfig from 'next/config';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { MediaServerType } from '../../../server/constants/server';
import { useUser } from '../../hooks/useUser';
import Accordion from '../Common/Accordion';
import ErrorCallout from '../Login/ErrorCallout';
import JellyfinLogin from '../Login/JellyfinLogin';
import PlexLogin from '../Login/PlexLogin';

const messages = defineMessages({
  welcome: 'Welcome to Jellyseerr',
  signinMessage: 'Get started by signing in',
  signinWithJellyfin: 'Use your {mediaServerName} account',
  signinWithPlex: 'Use your Plex account',
});

interface LoginWithMediaServerProps {
  onComplete: (onComplete: MediaServerType) => void;
}

const SetupLogin: React.FC<LoginWithMediaServerProps> = ({ onComplete }) => {
  const [error, setError] = useState('');
  const [mediaServerType, setMediaServerType] = useState<MediaServerType>(
    MediaServerType.NOT_CONFIGURED
  );
  const { user, revalidate } = useUser();
  const intl = useIntl();
  const { publicRuntimeConfig } = getConfig();

  useEffect(() => {
    if (user) {
      onComplete(mediaServerType);
    }
  }, [user, mediaServerType, onComplete]);

  return (
    <div>
      <div className="mb-2 flex justify-center text-xl font-bold">
        <FormattedMessage {...messages.welcome} />
      </div>
      <div className="mb-2 flex justify-center pb-6 text-sm">
        <FormattedMessage {...messages.signinMessage} />
      </div>
      <ErrorCallout error={error} />
      <Accordion single atLeastOne>
        {({ openIndexes, handleClick, AccordionContent }) => (
          <>
            <button
              className={`w-full cursor-default bg-gray-900 py-2 text-center text-sm text-gray-400 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-700 focus:outline-none sm:rounded-t-lg ${
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
                <PlexLogin
                  onAuthenticated={() => {
                    setMediaServerType(MediaServerType.PLEX);
                    revalidate();
                  }}
                  onError={(err) => setError(err)}
                />
              </div>
            </AccordionContent>
            <div>
              <button
                className={`w-full cursor-default bg-gray-900 py-2 text-center text-sm text-gray-400 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-700 focus:outline-none ${
                  openIndexes.includes(1)
                    ? 'text-indigo-500'
                    : 'sm:rounded-b-lg'
                }`}
                onClick={() => handleClick(1)}
              >
                {publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                  ? intl.formatMessage(messages.signinWithJellyfin, {
                      mediaServerName: 'Emby',
                    })
                  : intl.formatMessage(messages.signinWithJellyfin, {
                      mediaServerName: 'Jellyfin',
                    })}
              </button>
              <AccordionContent isOpen={openIndexes.includes(1)}>
                <div
                  className="rounded-b-lg px-10 py-8"
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
