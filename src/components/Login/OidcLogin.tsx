import Button from '@app/components/Common/Button';
import useSettings from '@app/hooks/useSettings';
import globalMessages from '@app/i18n/globalMessages';
import { LoginIcon } from '@heroicons/react/outline';
import axios from 'axios';
import type React from 'react';
import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useAuth } from 'react-oidc-context';

const messages = defineMessages({
  signinwithoidc: 'Sign in with {OIDCProvider}',
  signingin: 'Signing in…',
  loginerror: 'Something went wrong while trying to sign in.',
});

interface OidcLoginProps {
  revalidate: () => void;
  isProcessing: boolean;
  setProcessing: (state: boolean) => void;
  hasError: boolean;
  onError?: (message: string) => void;
}

const OidcLogin: React.FC<OidcLoginProps> = ({
  revalidate,
  isProcessing,
  setProcessing,
  hasError,
  onError,
}) => {
  const intl = useIntl();
  const auth = useAuth();
  const settings = useSettings();

  useEffect(() => {
    const login = async () => {
      setProcessing(true);
      try {
        await axios.post('/api/v1/auth/oidc', {
          idToken: auth.user?.id_token,
          accessToken: auth.user?.access_token,
        });
      } catch (e) {
        if (onError) onError(intl.formatMessage(messages.loginerror));
        setProcessing(false);
      } finally {
        revalidate();
      }
    };
    if (auth.isAuthenticated && !hasError) {
      login();
    }
  }, [auth, revalidate, intl, setProcessing, onError, hasError]);

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
