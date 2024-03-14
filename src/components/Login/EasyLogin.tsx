import Button from '@app/components/Common/Button';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  signin: 'Sign In',
  loginerror: 'Something went wrong while trying to sign in.',
  signingin: 'Signing in…',
});

interface EasyLoginProps {
  revalidate: () => void;
}

const EasyLogin = ({ revalidate }: EasyLoginProps) => {
  const intl = useIntl();
  const [loginError, setLoginError] = useState<string | null>(null);

  return (
    <Formik
      initialValues={{}}
      onSubmit={async () => {
        try {
          await axios.post('/api/v1/auth/easy');
        } catch (e) {
          setLoginError(intl.formatMessage(messages.loginerror));
        } finally {
          revalidate();
        }
      }}
    >
      {({ isSubmitting, isValid }) => {
        return (
          <>
            <Form>
              <div>
                {loginError && (
                  <div className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
                    <div className="error">{loginError}</div>
                  </div>
                )}
              </div>
              <div className="flex flex-row-reverse justify-center">
                <Button
                  buttonType="primary"
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  data-testid="local-signin-button"
                >
                  <ArrowLeftOnRectangleIcon />
                  <span>
                    {isSubmitting
                      ? intl.formatMessage(messages.signingin)
                      : intl.formatMessage(messages.signin)}
                  </span>
                </Button>
              </div>
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default EasyLogin;
