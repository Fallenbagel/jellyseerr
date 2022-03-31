import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import { useUser } from '../../../../hooks/useUser';
import Error from '../../../../pages/_error';
import Alert from '../../../Common/Alert';
import Button from '../../../Common/Button';
import LoadingSpinner from '../../../Common/LoadingSpinner';
import * as Yup from 'yup';
import useSettings from '../../../../hooks/useSettings';

const messages = defineMessages({
  password: 'Password',
  currentpassword: 'Current Password',
  newpassword: 'New Password',
  confirmpassword: 'Confirm Password',
  save: 'Save Changes',
  saving: 'Saving…',
  toastSettingsSuccess: 'Password changed!',
  toastSettingsFailure:
    'Something went wrong while changing the password. Is your current password correct?',
  validationCurrentPassword: 'You must provide your current password',
  validationNewPassword: 'You must provide a new password',
  validationNewPasswordLength:
    'Password is too short; should be a minimum of 8 characters',
  validationConfirmPassword: 'You must confirm your new password',
  validationConfirmPasswordSame: 'Password must match',
  nopasswordset: 'No Password Set',
  nopasswordsetDescription:
    'This user account currently does not have a password specifically for {applicationTitle}.\
    Configure a password below to enable this account to sign in as a "local user."',
});

const UserPasswordChange: React.FC = () => {
  const settings = useSettings();
  const intl = useIntl();
  const { addToast } = useToasts();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { user } = useUser({ id: Number(router.query.userId) });
  const { data, error, revalidate } = useSWR<{ hasPassword: boolean }>(
    user ? `/api/v1/user/${user?.id}/settings/password` : null
  );

  const PasswordChangeSchema = Yup.object().shape({
    currentPassword: Yup.lazy(() =>
      data?.hasPassword
        ? Yup.string().required(
            intl.formatMessage(messages.validationCurrentPassword)
          )
        : Yup.mixed().optional()
    ),
    newPassword: Yup.string()
      .required(intl.formatMessage(messages.validationNewPassword))
      .min(8, intl.formatMessage(messages.validationNewPasswordLength)),
    confirmPassword: Yup.string()
      .required(intl.formatMessage(messages.validationConfirmPassword))
      .oneOf(
        [Yup.ref('newPassword'), null],
        intl.formatMessage(messages.validationConfirmPasswordSame)
      ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="heading">{intl.formatMessage(messages.password)}</h3>
      </div>
      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={PasswordChangeSchema}
        enableReinitialize
        onSubmit={async (values, { resetForm }) => {
          try {
            await axios.post(`/api/v1/user/${user?.id}/settings/password`, {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
              confirmPassword: values.confirmPassword,
            });

            addToast(intl.formatMessage(messages.toastSettingsSuccess), {
              autoDismiss: true,
              appearance: 'success',
            });
          } catch (e) {
            addToast(intl.formatMessage(messages.toastSettingsFailure), {
              autoDismiss: true,
              appearance: 'error',
            });
          } finally {
            revalidate();
            resetForm();
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => {
          return (
            <Form className="section">
              {!data.hasPassword && (
                <Alert
                  type="warning"
                  title={intl.formatMessage(messages.nopasswordset)}
                >
                  {intl.formatMessage(messages.nopasswordsetDescription, {
                    applicationTitle: settings.currentSettings.applicationTitle,
                  })}
                </Alert>
              )}
              {data.hasPassword && user?.id === currentUser?.id && (
                <div className="pb-6 form-row">
                  <label htmlFor="currentPassword" className="text-label">
                    {intl.formatMessage(messages.currentpassword)}
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        id="currentPassword"
                        name="currentPassword"
                        type="text"
                      />
                    </div>
                    {errors.currentPassword && touched.currentPassword && (
                      <div className="error">{errors.currentPassword}</div>
                    )}
                  </div>
                </div>
              )}
              <div className="form-row">
                <label htmlFor="newPassword" className="text-label">
                  {intl.formatMessage(messages.newpassword)}
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field id="newPassword" name="newPassword" type="text" />
                  </div>
                  {errors.newPassword && touched.newPassword && (
                    <div className="error">{errors.newPassword}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="confirmPassword" className="text-label">
                  {intl.formatMessage(messages.confirmpassword)}
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="text"
                    />
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="error">{errors.confirmPassword}</div>
                  )}
                </div>
              </div>
              <div className="actions">
                <div className="flex justify-end">
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? intl.formatMessage(messages.saving)
                        : intl.formatMessage(messages.save)}
                    </Button>
                  </span>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default UserPasswordChange;
