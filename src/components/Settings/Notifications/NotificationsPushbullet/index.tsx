import React from 'react';
import { Field, Form, Formik } from 'formik';
import useSWR from 'swr';
import LoadingSpinner from '../../../Common/LoadingSpinner';
import Button from '../../../Common/Button';
import { defineMessages, useIntl } from 'react-intl';
import axios from 'axios';
import * as Yup from 'yup';
import { useToasts } from 'react-toast-notifications';
import Alert from '../../../Common/Alert';
import NotificationTypeSelector from '../../../NotificationTypeSelector';

const messages = defineMessages({
  save: 'Save Changes',
  saving: 'Saving…',
  agentEnabled: 'Enable Agent',
  accessToken: 'Access Token',
  validationAccessTokenRequired: 'You must provide an access token',
  pushbulletSettingsSaved:
    'Pushbullet notification settings saved successfully!',
  pushbulletSettingsFailed: 'Pushbullet notification settings failed to save.',
  testSent: 'Test notification sent!',
  test: 'Test',
  settingUpPushbullet: 'Setting Up Pushbullet Notifications',
  settingUpPushbulletDescription:
    'To configure Pushbullet notifications, you will need to <CreateAccessTokenLink>create an access token</CreateAccessTokenLink> and enter it below.',
  notificationTypes: 'Notification Types',
});

const NotificationsPushbullet: React.FC = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const { data, error, revalidate } = useSWR(
    '/api/v1/settings/notifications/pushbullet'
  );

  const NotificationsPushbulletSchema = Yup.object().shape({
    accessToken: Yup.string().required(
      intl.formatMessage(messages.validationAccessTokenRequired)
    ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        enabled: data?.enabled,
        types: data?.types,
        accessToken: data?.options.accessToken,
      }}
      validationSchema={NotificationsPushbulletSchema}
      onSubmit={async (values) => {
        try {
          await axios.post('/api/v1/settings/notifications/pushbullet', {
            enabled: values.enabled,
            types: values.types,
            options: {
              accessToken: values.accessToken,
            },
          });
          addToast(intl.formatMessage(messages.pushbulletSettingsSaved), {
            appearance: 'success',
            autoDismiss: true,
          });
        } catch (e) {
          addToast(intl.formatMessage(messages.pushbulletSettingsFailed), {
            appearance: 'error',
            autoDismiss: true,
          });
        } finally {
          revalidate();
        }
      }}
    >
      {({ errors, touched, isSubmitting, values, isValid, setFieldValue }) => {
        const testSettings = async () => {
          await axios.post('/api/v1/settings/notifications/pushbullet/test', {
            enabled: true,
            types: values.types,
            options: {
              accessToken: values.accessToken,
            },
          });

          addToast(intl.formatMessage(messages.testSent), {
            appearance: 'info',
            autoDismiss: true,
          });
        };

        return (
          <>
            <Alert
              title={intl.formatMessage(messages.settingUpPushbullet)}
              type="info"
            >
              {intl.formatMessage(messages.settingUpPushbulletDescription, {
                CreateAccessTokenLink: function CreateAccessTokenLink(msg) {
                  return (
                    <a
                      href="https://www.pushbullet.com/#settings"
                      className="text-indigo-100 hover:text-white hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {msg}
                    </a>
                  );
                },
              })}
            </Alert>
            <Form className="section">
              <div className="form-row">
                <label htmlFor="enabled" className="checkbox-label">
                  {intl.formatMessage(messages.agentEnabled)}
                </label>
                <div className="form-input">
                  <Field type="checkbox" id="enabled" name="enabled" />
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="accessToken" className="text-label">
                  {intl.formatMessage(messages.accessToken)}
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field
                      id="accessToken"
                      name="accessToken"
                      type="text"
                      placeholder={intl.formatMessage(messages.accessToken)}
                    />
                  </div>
                  {errors.accessToken && touched.accessToken && (
                    <div className="error">{errors.accessToken}</div>
                  )}
                </div>
              </div>
              <div
                role="group"
                aria-labelledby="group-label"
                className="form-group"
              >
                <div className="form-row">
                  <span id="group-label" className="group-label">
                    {intl.formatMessage(messages.notificationTypes)}
                  </span>
                  <div className="form-input">
                    <div className="max-w-lg">
                      <NotificationTypeSelector
                        currentTypes={values.types}
                        onUpdate={(newTypes) =>
                          setFieldValue('types', newTypes)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="actions">
                <div className="flex justify-end">
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
                    <Button
                      buttonType="warning"
                      disabled={isSubmitting || !isValid}
                      onClick={(e) => {
                        e.preventDefault();

                        testSettings();
                      }}
                    >
                      {intl.formatMessage(messages.test)}
                    </Button>
                  </span>
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      type="submit"
                      disabled={isSubmitting || !isValid}
                    >
                      {isSubmitting
                        ? intl.formatMessage(messages.saving)
                        : intl.formatMessage(messages.save)}
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

export default NotificationsPushbullet;
