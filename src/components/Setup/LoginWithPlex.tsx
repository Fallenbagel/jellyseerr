import React, { useEffect, useState } from 'react';
import { useUser } from '../../hooks/useUser';
import PlexLoginButton from '../PlexLoginButton';
import axios from 'axios';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  welcome: 'Welcome to Overseerr',
  signinMessage: 'Get started by logging in with your Plex account',
});

interface LoginWithPlexProps {
  onComplete: () => void;
}

const LoginWithPlex: React.FC<LoginWithPlexProps> = ({ onComplete }) => {
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const { user, revalidate } = useUser();

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to login. If we get a success message, we will
  // ask swr to revalidate the user which _shouid_ come back with a valid user.

  useEffect(() => {
    const login = async () => {
      const response = await axios.post('/api/v1/auth/plex', { authToken });

      if (response.data?.email) {
        revalidate();
      }
    };
    if (authToken) {
      login();
    }
  }, [authToken, revalidate]);

  // Effect that is triggered whenever `useUser`'s user changes. If we get a new
  // valid user, we call onComplete which will take us to the next step in Setup.
  useEffect(() => {
    if (user) {
      onComplete();
    }
  }, [user, onComplete]);

  return (
    <form>
      <div className="flex justify-center mb-2 text-xl font-bold">
        <FormattedMessage {...messages.welcome} />
      </div>
      <div className="flex justify-center pb-6 mb-2 text-sm">
        <FormattedMessage {...messages.signinMessage} />
      </div>
      <div className="flex items-center justify-center">
        <PlexLoginButton onAuthToken={(authToken) => setAuthToken(authToken)} />
      </div>
    </form>
  );
};

export default LoginWithPlex;
