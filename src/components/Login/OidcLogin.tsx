import { LoginIcon } from '@heroicons/react/outline';
import axios from 'axios';
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useAuth } from 'react-oidc-context';
import useSettings from '../../hooks/useSettings';
import globalMessages from '../../i18n/globalMessages';
import Button from '../Common/Button';

const messages = defineMessages({
  signinwithoidc: 'Sign in with {OIDCProvider}',
  signingin: 'Signing in…',
  loginerror: 'Something went wrong while trying to sign in.',
});

interface OidcLoginProps {
  revalidate: () => void;
  setError: (message: string) => void;
  isProcessing: boolean;
  setProcessing: (state: boolean) => void;
}

const OidcLogin: React.FC<OidcLoginProps> = ({
  revalidate,
  setError,
  isProcessing,
  setProcessing,
}) => {
  const intl = useIntl();
  const auth = useAuth();
  const settings = useSettings();

  useEffect(() => {
    const login = async () => {
      setProcessing(true);
      try {
        const token = auth.user?.access_token;
        // eslint-disable-next-line
        const response = await axios.get('/api/v1/auth/oidc', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        setError(intl.formatMessage(messages.loginerror));
        setProcessing(false);
      } finally {
        revalidate();
      }
    };
    if (auth.isAuthenticated) {
      login();
    }
  }, [auth, revalidate, intl, setProcessing, setError]);

  return (
    <span className="block w-full rounded-md shadow-sm">
      <Button
        buttonType="primary"
        className="w-full"
        onClick={() => auth.signinRedirect()}
        disabled={auth.isLoading || isProcessing}
      >
        <LoginIcon />
        <span>
          {auth.isLoading
            ? intl.formatMessage(globalMessages.loading)
            : intl.formatMessage(messages.signinwithoidc, {
                OIDCProvider: settings.currentSettings.oidcProviderName,
              })}
        </span>
      </Button>
    </span>
  );
};

export default OidcLogin;
