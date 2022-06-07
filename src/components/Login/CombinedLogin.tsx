import React, { useState } from 'react';
import useSettings from '../../hooks/useSettings';
import { defineMessages, useIntl } from 'react-intl';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Button from '../Common/Button';
import { LoginIcon, SupportIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import SensitiveInput from '../Common/SensitiveInput';
import axios from 'axios';
import * as EmailValidator from 'email-validator';

const messages = defineMessages({
  username: 'Username',
  email: 'Email Address',
  password: 'Password',
  validationuseremailrequired:
    'You must provide a valid username or email address',
  validationpasswordrequired: 'You must provide a password',
  loginerror: 'Something went wrong while trying to sign in.',
  signingin: 'Signing In…',
  signin: 'Sign In',
  forgotpassword: 'Forgot Password?',
});

interface CombinedLoginProps {
  revalidate: () => void;
  initial?: boolean;
}

const CombinedLogin: React.FC<CombinedLoginProps> = ({ revalidate }) => {
  const intl = useIntl();
  const settings = useSettings();
  const [loginError, setLoginError] = useState<string | null>(null);

  const loginSchema = Yup.object().shape({
    userEMail: Yup.string().required(
      intl.formatMessage(messages.validationuseremailrequired)
    ),
    password: Yup.string().required(
      intl.formatMessage(messages.validationpasswordrequired)
    ),
  });

  const passwordResetEnabled =
    settings.currentSettings.applicationUrl &&
    settings.currentSettings.emailEnabled;

  return (
    <Formik
      initialValues={{
        userEMail: '',
        password: '',
      }}
      validationSchema={loginSchema}
      onSubmit={async (values) => {
        try {
          // check if userEMail is a username or email address
          if (EmailValidator.validate(values.userEMail)) {
            await axios.post('/api/v1/auth/local', {
              email: values.userEMail,
              password: values.password,
            });
          } else {
            await axios.post('/api/v1/auth/jellyfin', {
              username: values.userEMail,
              password: values.password,
              email: values.userEMail,
            });
          }
        } catch (e) {
          setLoginError(intl.formatMessage(messages.loginerror));
        } finally {
          revalidate();
        }
      }}
    >
      {({ errors, touched, isSubmitting, isValid }) => {
        return (
          <>
            <Form>
              <div>
                <label htmlFor="userEMail" className="text-label">
                  {intl.formatMessage(messages.username) +
                    ' / ' +
                    intl.formatMessage(messages.email)}
                </label>
                <div className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
                  <div className="form-input-field">
                    <Field
                      id="userEMail"
                      name="userEMail"
                      type="text"
                      inputMode="text"
                    />
                  </div>
                  {errors.userEMail && touched.userEMail && (
                    <div className="error">{errors.userEMail}</div>
                  )}
                </div>
                <label htmlFor="password" className="text-label">
                  {intl.formatMessage(messages.password)}
                </label>
                <div className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
                  <div className="form-input-field">
                    <SensitiveInput
                      as="field"
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && touched.password && (
                    <div className="error">{errors.password}</div>
                  )}
                </div>
                {loginError && (
                  <div className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
                    <div className="error">{loginError}</div>
                  </div>
                )}
              </div>
              <div className="mt-8 border-t border-gray-700 pt-5">
                <div className="flex flex-row-reverse justify-between">
                  <span className="inline-flex rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      type="submit"
                      disabled={isSubmitting || !isValid}
                    >
                      <LoginIcon />
                      <span>
                        {isSubmitting
                          ? intl.formatMessage(messages.signingin)
                          : intl.formatMessage(messages.signin)}
                      </span>
                    </Button>
                  </span>
                  {passwordResetEnabled && (
                    <span className="inline-flex rounded-md shadow-sm">
                      <Link href="/resetpassword" passHref>
                        <Button as="a" buttonType="ghost">
                          <SupportIcon />
                          <span>
                            {intl.formatMessage(messages.forgotpassword)}
                          </span>
                        </Button>
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default CombinedLogin;
