import React, { useState } from 'react';
import PlexOAuth from '../../utils/plex';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  signinwithplex: 'Sign In',
  loading: 'Loading…',
  signingin: 'Signing in…',
});

const plexOAuth = new PlexOAuth();

interface PlexLoginButtonProps {
  onAuthToken: (authToken: string) => void;
  isProcessing?: boolean;
  onError?: (message: string) => void;
}

const PlexLoginButton: React.FC<PlexLoginButtonProps> = ({
  onAuthToken,
  onError,
  isProcessing,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const getPlexLogin = async () => {
    setLoading(true);
    try {
      const authToken = await plexOAuth.login();
      setLoading(false);
      onAuthToken(authToken);
    } catch (e) {
      if (onError) {
        onError(e.message);
      }
      setLoading(false);
    }
  };
  return (
    <span className="block w-full rounded-md shadow-sm">
      <button
        type="button"
        onClick={() => {
          plexOAuth.preparePopup();
          setTimeout(() => getPlexLogin(), 1500);
        }}
        disabled={loading || isProcessing}
        className="plex-button"
      >
        {loading
          ? intl.formatMessage(messages.loading)
          : isProcessing
          ? intl.formatMessage(messages.signingin)
          : intl.formatMessage(messages.signinwithplex)}
      </button>
    </span>
  );
};

export default PlexLoginButton;
