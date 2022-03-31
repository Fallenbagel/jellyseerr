import React from 'react';
import { Field, Form, Formik } from 'formik';
import useSWR from 'swr';
import LoadingSpinner from '../../Common/LoadingSpinner';
import Button from '../../Common/Button';
import { defineMessages, useIntl } from 'react-intl';
import axios from 'axios';
import * as Yup from 'yup';
import { useToasts } from 'react-toast-notifications';
import NotificationTypeSelector from '../../NotificationTypeSelector';

const messages = defineMessages({
  save: 'Save Changes',
  saving: 'Saving…',
  agentenabled: 'Enable Agent',
  webhookUrl: 'Webhook URL',
  webhookUrlPlaceholder: 'Server Settings → Integrations → Webhooks',
  discordsettingssaved: 'Discord notification settings saved successfully!',
  discordsettingsfailed: 'Discord notification settings failed to save.',
  testsent: 'Test notification sent!',
  test: 'Test',
  notificationtypes: 'Notification Types',
  validationWebhookUrl: 'You must provide a valid URL',
});

const NotificationsDiscord: React.FC = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const { data, error, revalidate } = useSWR(
    '/api/v1/settings/notifications/discord'
  );

  const NotificationsDiscordSchema = Yup.object().shape({
    webhookUrl: Yup.string()
      .required(intl.formatMessage(messages.validationWebhookUrl))
      .url(intl.formatMessage(messages.validationWebhookUrl)),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        enabled: data.enabled,
        types: data.types,
        webhookUrl: data.options.webhookUrl,
      }}
      validationSchema={NotificationsDiscordSchema}
      onSubmit={async (values) => {
        try {
          await axios.post('/api/v1/settings/notifications/discord', {
            enabled: values.enabled,
            types: values.types,
            options: {
              webhookUrl: values.webhookUrl,
            },
          });
          addToast(intl.formatMessage(messages.discordsettingssaved), {
            appearance: 'success',
            autoDismiss: true,
          });
        } catch (e) {
          addToast(intl.formatMessage(messages.discordsettingsfailed), {
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
          await axios.post('/api/v1/settings/notifications/discord/test', {
            enabled: true,
            types: values.types,
            options: {
              webhookUrl: values.webhookUrl,
            },
          });

          addToast(intl.formatMessage(messages.testsent), {
            appearance: 'info',
            autoDismiss: true,
          });
        };

        return (
          <Form className="section">
            <div className="form-row">
              <label htmlFor="enabled" className="checkbox-label">
                {intl.formatMessage(messages.agentenabled)}
              </label>
              <div className="form-input">
                <Field type="checkbox" id="enabled" name="enabled" />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="name" className="text-label">
                {intl.formatMessage(messages.webhookUrl)}
              </label>
              <div className="form-input">
                <div className="flex max-w-lg rounded-md shadow-sm">
                  <Field
                    id="webhookUrl"
                    name="webhookUrl"
                    type="text"
                    placeholder={intl.formatMessage(
                      messages.webhookUrlPlaceholder
                    )}
                  />
                </div>
                {errors.webhookUrl && touched.webhookUrl && (
                  <div className="error">{errors.webhookUrl}</div>
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
                  {intl.formatMessage(messages.notificationtypes)}
                </span>
                <div className="form-input">
                  <div className="max-w-lg">
                    <NotificationTypeSelector
                      currentTypes={values.types}
                      onUpdate={(newTypes) => setFieldValue('types', newTypes)}
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
        );
      }}
    </Formik>
  );
};

export default NotificationsDiscord;
