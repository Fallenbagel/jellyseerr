import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Button from '../Common/Button';

import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import useSettings from '../../hooks/useSettings';
import AddEmailModal from './AddEmailModal';

const messages = defineMessages({
  username: 'Username',
  password: 'Password',
  host: 'Jellyfin URL',
  email: 'Email',
  validationhostrequired: 'Jellyfin URL required',
  validationhostformat: 'Valid URL required',
  validationemailrequired: 'Email required',
  validationemailformat: 'Valid email required',
  validationusernamerequired: 'Username required',
  validationpasswordrequired: 'Password required',
  loginerror: 'Something went wrong while trying to sign in.',
  credentialerror: 'The username or password is incorrect.',
  signingin: 'Signing in…',
  signin: 'Sign In',
  initialsigningin: 'Connecting…',
  initialsignin: 'Connect',
  forgotpassword: 'Forgot Password?',
});

interface JellyfinLoginProps {
  revalidate: () => void;
  initial?: boolean;
}

const JellyfinLogin: React.FC<JellyfinLoginProps> = ({
  revalidate,
  initial,
}) => {
  const [requiresEmail, setRequiresEmail] = useState<number>(0);
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const toasts = useToasts();
  const intl = useIntl();
  const settings = useSettings();

  if (initial) {
    const LoginSchema = Yup.object().shape({
      host: Yup.string()
        .url(intl.formatMessage(messages.validationhostformat))
        .required(intl.formatMessage(messages.validationhostrequired)),
      email: Yup.string()
        .email(intl.formatMessage(messages.validationemailformat))
        .required(intl.formatMessage(messages.validationemailrequired)),
      username: Yup.string().required(
        intl.formatMessage(messages.validationusernamerequired)
      ),
      password: Yup.string().required(
        intl.formatMessage(messages.validationpasswordrequired)
      ),
    });
    return (
      <Formik
        initialValues={{
          username: '',
          password: '',
          host: '',
          email: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={async (values) => {
          try {
            await axios.post('/api/v1/auth/jellyfin', {
              username: values.username,
              password: values.password,
              hostname: values.host,
              email: values.email,
            });
          } catch (e) {
            toasts.addToast(
              intl.formatMessage(
                e.message == 'Request failed with status code 401'
                  ? messages.credentialerror
                  : messages.loginerror
              ),
              {
                autoDismiss: true,
                appearance: 'error',
              }
            );
          } finally {
            revalidate();
          }
        }}
      >
        {({ errors, touched, isSubmitting, isValid }) => (
          <Form>
            <div className="sm:border-t sm:border-gray-800">
              <label htmlFor="host" className="text-label">
                {intl.formatMessage(messages.host)}
              </label>
              <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                <div className="flex rounded-md shadow-sm">
                  <Field
                    id="host"
                    name="host"
                    type="text"
                    placeholder={intl.formatMessage(messages.host)}
                  />
                </div>
                {errors.host && touched.host && (
                  <div className="error">{errors.host}</div>
                )}
              </div>
              <label htmlFor="email" className="text-label">
                {intl.formatMessage(messages.email)}
              </label>
              <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                <div className="flex rounded-md shadow-sm">
                  <Field
                    id="email"
                    name="email"
                    type="text"
                    placeholder={intl.formatMessage(messages.email)}
                  />
                </div>
                {errors.email && touched.email && (
                  <div className="error">{errors.email}</div>
                )}
              </div>
              <label htmlFor="username" className="text-label">
                {intl.formatMessage(messages.username)}
              </label>
              <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                <div className="flex rounded-md shadow-sm">
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    placeholder={intl.formatMessage(messages.username)}
                  />
                </div>
                {errors.username && touched.username && (
                  <div className="error">{errors.username}</div>
                )}
              </div>
              <label htmlFor="password" className="text-label">
                {intl.formatMessage(messages.password)}
              </label>
              <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                <div className="shadow-sm flexrounded-md">
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder={intl.formatMessage(messages.password)}
                  />
                </div>
                {errors.password && touched.password && (
                  <div className="error">{errors.password}</div>
                )}
              </div>
            </div>
            <div className="pt-5 mt-8 border-t border-gray-700">
              <div className="flex justify-end">
                <span className="inline-flex rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting
                      ? intl.formatMessage(messages.signingin)
                      : intl.formatMessage(messages.signin)}
                  </Button>
                </span>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    );
  } else {
    const LoginSchema = Yup.object().shape({
      username: Yup.string().required(
        intl.formatMessage(messages.validationusernamerequired)
      ),
      password: Yup.string().required(
        intl.formatMessage(messages.validationpasswordrequired)
      ),
    });
    return (
      <div>
        {requiresEmail == 1 && (
          <AddEmailModal
            username={username ?? ''}
            password={password ?? ''}
            onSave={revalidate}
            onClose={() => setRequiresEmail(0)}
          ></AddEmailModal>
        )}
        <Formik
          initialValues={{
            username: '',
            password: '',
          }}
          validationSchema={LoginSchema}
          onSubmit={async (values) => {
            try {
              await axios.post('/api/v1/auth/jellyfin', {
                username: values.username,
                password: values.password,
              });
            } catch (e) {
              if (e.message === 'Request failed with status code 406') {
                setUsername(values.username);
                setPassword(values.password);
                setRequiresEmail(1);
              } else {
                toasts.addToast(
                  intl.formatMessage(
                    e.message == 'Request failed with status code 401'
                      ? messages.credentialerror
                      : messages.loginerror
                  ),
                  {
                    autoDismiss: true,
                    appearance: 'error',
                  }
                );
              }
            } finally {
              revalidate();
            }
          }}
        >
          {({ errors, touched, isSubmitting, isValid }) => {
            return (
              <>
                <Form>
                  <div className="sm:border-t sm:border-gray-800">
                    <label htmlFor="username" className="text-label">
                      {intl.formatMessage(messages.username)}
                    </label>
                    <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                      <div className="flex max-w-lg rounded-md shadow-sm">
                        <Field
                          id="username"
                          name="username"
                          type="text"
                          placeholder={intl.formatMessage(messages.username)}
                        />
                      </div>
                      {errors.username && touched.username && (
                        <div className="error">{errors.username}</div>
                      )}
                    </div>
                    <label htmlFor="password" className="text-label">
                      {intl.formatMessage(messages.password)}
                    </label>
                    <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                      <div className="flex max-w-lg rounded-md shadow-sm">
                        <Field
                          id="password"
                          name="password"
                          type="password"
                          placeholder={intl.formatMessage(messages.password)}
                        />
                      </div>
                      {errors.password && touched.password && (
                        <div className="error">{errors.password}</div>
                      )}
                    </div>
                  </div>
                  <div className="pt-5 mt-8 border-t border-gray-700">
                    <div className="flex justify-between">
                      <span className="inline-flex rounded-md shadow-sm">
                        <Button
                          as="a"
                          buttonType="ghost"
                          href={
                            settings.currentSettings.jellyfinHost +
                            '/web/#!/forgotpassword.html'
                          }
                        >
                          {intl.formatMessage(messages.forgotpassword)}
                        </Button>
                      </span>
                      <span className="inline-flex rounded-md shadow-sm">
                        <Button
                          buttonType="primary"
                          type="submit"
                          disabled={isSubmitting || !isValid}
                        >
                          {isSubmitting
                            ? intl.formatMessage(messages.signingin)
                            : intl.formatMessage(messages.signin)}
                        </Button>
                      </span>
                    </div>
                  </div>
                </Form>
              </>
            );
          }}
        </Formik>
      </div>
    );
  }
};

export default JellyfinLogin;
