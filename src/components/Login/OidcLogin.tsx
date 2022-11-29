import Button from '@app/components/Common/Button';
import useSettings from '@app/hooks/useSettings';
import globalMessages from '@app/i18n/globalMessages';
import OIDCAuth from '@app/utils/oidc';
import { LoginIcon } from '@heroicons/react/outline';
import type React from 'react';
import { defineMessages, useIntl } from 'react-intl';

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
  onError: (message: string) => void;
}

const oidcAuth = new OIDCAuth();

const OidcLogin: React.FC<OidcLoginProps> = ({
  revalidate,
  isProcessing,
  setProcessing,
  hasError,
  onError,
}) => {
  const intl = useIntl();
  const settings = useSettings();

  const handleClick = async () => {
    setProcessing(true);
    try {
      await oidcAuth.preparePopup();
      revalidate();
    } catch (e) {
      let message = 'Unknown Error';
      if (e instanceof Error) message = e.message;
      onError(message);
      return;
    } finally {
      setProcessing(false);
    }
  };

  return (
    <span className="block w-full rounded-md shadow-sm">
      <Button
        buttonType="primary"
        className="w-full"
        onClick={handleClick}
        disabled={isProcessing || hasError}
      >
        <LoginIcon />
        <span>
          {isProcessing
            ? intl.formatMessage(globalMessages.loading)
            : intl.formatMessage(messages.signinwithoidc, {
                OIDCProvider: settings.currentSettings.oidcName,
              })}
        </span>
      </Button>
    </span>
  );
};

export default OidcLogin;
