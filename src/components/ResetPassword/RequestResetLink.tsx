import React, { useState } from 'react';
import ImageFader from '../Common/ImageFader';
import { defineMessages, useIntl } from 'react-intl';
import LanguagePicker from '../Layout/LanguagePicker';
import Button from '../Common/Button';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Link from 'next/link';

const messages = defineMessages({
  forgotpassword: 'Forgot Your Password?',
  emailresetlink: 'Email Me a Recovery Link',
  email: 'Email',
  validationemailrequired: 'You must provide a valid email address',
  gobacklogin: 'Go Back to Sign-In Page',
  requestresetlinksuccessmessage:
    'A password reset link will be sent to the provided email address if it is associated with a valid user.',
});

const ResetPassword: React.FC = () => {
  const intl = useIntl();
  const [hasSubmitted, setSubmitted] = useState(false);

  const ResetSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage(messages.validationemailrequired))
      .required(intl.formatMessage(messages.validationemailrequired)),
  });

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-900 py-14">
      <ImageFader
        backgroundImages={[
          '/images/rotate1.jpg',
          '/images/rotate2.jpg',
          '/images/rotate3.jpg',
          '/images/rotate4.jpg',
          '/images/rotate5.jpg',
          '/images/rotate6.jpg',
        ]}
      />
      <div className="absolute z-50 top-4 right-4">
        <LanguagePicker />
      </div>
      <div className="relative z-40 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <img
          src="/logo.png"
          className="w-auto mx-auto max-h-32"
          alt="Overseerr Logo"
        />
        <h2 className="mt-2 text-3xl font-extrabold leading-9 text-center text-gray-100">
          {intl.formatMessage(messages.forgotpassword)}
        </h2>
      </div>
      <div className="relative z-50 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className="bg-gray-800 bg-opacity-50 shadow sm:rounded-lg"
          style={{ backdropFilter: 'blur(5px)' }}
        >
          <div className="px-10 py-8">
            {hasSubmitted ? (
              <>
                <p className="text-gray-300 text-md">
                  {intl.formatMessage(messages.requestresetlinksuccessmessage)}
                </p>
                <span className="flex justify-center mt-4 rounded-md shadow-sm">
                  <Link href="/login" passHref>
                    <Button as="a" buttonType="ghost">
                      {intl.formatMessage(messages.gobacklogin)}
                    </Button>
                  </Link>
                </span>
              </>
            ) : (
              <Formik
                initialValues={{
                  email: '',
                }}
                validationSchema={ResetSchema}
                onSubmit={async (values) => {
                  const response = await axios.post(
                    `/api/v1/auth/reset-password`,
                    {
                      email: values.email,
                    }
                  );

                  if (response.status === 200) {
                    setSubmitted(true);
                  }
                }}
              >
                {({ errors, touched, isSubmitting, isValid }) => {
                  return (
                    <Form>
                      <div className="sm:border-t sm:border-gray-800">
                        <label
                          htmlFor="email"
                          className="block my-1 text-sm font-medium leading-5 text-gray-400 sm:mt-px"
                        >
                          {intl.formatMessage(messages.email)}
                        </label>
                        <div className="mt-1 mb-2 sm:mt-0 sm:col-span-2">
                          <div className="flex max-w-lg rounded-md shadow-sm">
                            <Field
                              id="email"
                              name="email"
                              type="text"
                              placeholder="name@example.com"
                              className="flex-1 block w-full min-w-0 text-white transition duration-150 ease-in-out bg-gray-700 border border-gray-500 rounded-md form-input sm:text-sm sm:leading-5"
                            />
                          </div>
                          {errors.email && touched.email && (
                            <div className="error">{errors.email}</div>
                          )}
                        </div>
                      </div>
                      <div className="pt-5 mt-4 border-t border-gray-700">
                        <div className="flex justify-end">
                          <span className="inline-flex rounded-md shadow-sm">
                            <Button
                              buttonType="primary"
                              type="submit"
                              disabled={isSubmitting || !isValid}
                            >
                              {intl.formatMessage(messages.emailresetlink)}
                            </Button>
                          </span>
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
