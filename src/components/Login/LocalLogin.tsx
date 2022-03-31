import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Button from '../Common/Button';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Link from 'next/link';

const messages = defineMessages({
  email: 'Email Address',
  password: 'Password',
  validationemailrequired: 'Not a valid email address',
  validationpasswordrequired: 'Password required',
  loginerror: 'Something went wrong while trying to sign in.',
  signingin: 'Signing in…',
  signin: 'Sign In',
  forgotpassword: 'Forgot Password?',
});

interface LocalLoginProps {
  revalidate: () => void;
}

const LocalLogin: React.FC<LocalLoginProps> = ({ revalidate }) => {
  const intl = useIntl();
  const [loginError, setLoginError] = useState<string | null>(null);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email()
      .required(intl.formatMessage(messages.validationemailrequired)),
    password: Yup.string().required(
      intl.formatMessage(messages.validationpasswordrequired)
    ),
  });

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={LoginSchema}
      onSubmit={async (values) => {
        try {
          await axios.post('/api/v1/auth/local', {
            email: values.email,
            password: values.password,
          });
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
              <div className="sm:border-t sm:border-gray-800">
                <label htmlFor="email" className="text-label">
                  {intl.formatMessage(messages.email)}
                </label>
                <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field
                      id="email"
                      name="email"
                      type="text"
                      placeholder="name@example.com"
                    />
                  </div>
                  {errors.email && touched.email && (
                    <div className="error">{errors.email}</div>
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
                {loginError && (
                  <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                    <div className="error">{loginError}</div>
                  </div>
                )}
              </div>
              <div className="pt-5 mt-8 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="inline-flex rounded-md shadow-sm">
                    <Link href="/resetpassword" passHref>
                      <Button as="a" buttonType="ghost">
                        {intl.formatMessage(messages.forgotpassword)}
                      </Button>
                    </Link>
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
  );
};

export default LocalLogin;
