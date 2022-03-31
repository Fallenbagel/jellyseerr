import React from 'react';
import { Field, Form, Formik } from 'formik';
import useSWR from 'swr';
import LoadingSpinner from '../../Common/LoadingSpinner';
import Button from '../../Common/Button';
import { defineMessages, useIntl } from 'react-intl';
import axios from 'axios';
import * as Yup from 'yup';
import { useToasts } from 'react-toast-notifications';
import Alert from '../../Common/Alert';
import NotificationTypeSelector from '../../NotificationTypeSelector';

const messages = defineMessages({
  save: 'Save Changes',
  saving: 'Saving…',
  agentenabled: 'Enable Agent',
  botAPI: 'Bot Authentication Token',
  chatId: 'Chat ID',
  validationBotAPIRequired: 'You must provide a bot authentication token',
  validationChatIdRequired: 'You must provide a chat ID',
  telegramsettingssaved: 'Telegram notification settings saved successfully!',
  telegramsettingsfailed: 'Telegram notification settings failed to save.',
  testsent: 'Test notification sent!',
  test: 'Test',
  settinguptelegram: 'Setting Up Telegram Notifications',
  settinguptelegramDescription:
    'To configure Telegram notifications, you will need to <CreateBotLink>create a bot</CreateBotLink> and get the bot API key.\
    Additionally, you will need the chat ID for the chat to which you would like to send notifications.\
    You can get this by adding <GetIdBotLink>@get_id_bot</GetIdBotLink> to the chat.',
  notificationtypes: 'Notification Types',
  sendSilently: 'Send Silently',
  sendSilentlyTip: 'Send notifications with no sound',
});

const NotificationsTelegram: React.FC = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const { data, error, revalidate } = useSWR(
    '/api/v1/settings/notifications/telegram'
  );

  const NotificationsTelegramSchema = Yup.object().shape({
    botAPI: Yup.string().required(
      intl.formatMessage(messages.validationBotAPIRequired)
    ),
    chatId: Yup.string().required(
      intl.formatMessage(messages.validationChatIdRequired)
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
        botAPI: data?.options.botAPI,
        chatId: data?.options.chatId,
        sendSilently: data?.options.sendSilently,
      }}
      validationSchema={NotificationsTelegramSchema}
      onSubmit={async (values) => {
        try {
          await axios.post('/api/v1/settings/notifications/telegram', {
            enabled: values.enabled,
            types: values.types,
            options: {
              botAPI: values.botAPI,
              chatId: values.chatId,
              sendSilently: values.sendSilently,
            },
          });
          addToast(intl.formatMessage(messages.telegramsettingssaved), {
            appearance: 'success',
            autoDismiss: true,
          });
        } catch (e) {
          addToast(intl.formatMessage(messages.telegramsettingsfailed), {
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
          await axios.post('/api/v1/settings/notifications/telegram/test', {
            enabled: true,
            types: values.types,
            options: {
              botAPI: values.botAPI,
              chatId: values.chatId,
              sendSilently: values.sendSilently,
            },
          });

          addToast(intl.formatMessage(messages.testsent), {
            appearance: 'info',
            autoDismiss: true,
          });
        };

        return (
          <>
            <Alert
              title={intl.formatMessage(messages.settinguptelegram)}
              type="info"
            >
              {intl.formatMessage(messages.settinguptelegramDescription, {
                CreateBotLink: function CreateBotLink(msg) {
                  return (
                    <a
                      href="https://core.telegram.org/bots#6-botfather"
                      className="text-indigo-100 hover:text-white hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {msg}
                    </a>
                  );
                },
                GetIdBotLink: function GetIdBotLink(msg) {
                  return (
                    <a
                      href="https://telegram.me/get_id_bot"
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
                  {intl.formatMessage(messages.agentenabled)}
                </label>
                <div className="form-input">
                  <Field type="checkbox" id="enabled" name="enabled" />
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="botAPI" className="text-label">
                  {intl.formatMessage(messages.botAPI)}
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field
                      id="botAPI"
                      name="botAPI"
                      type="text"
                      placeholder={intl.formatMessage(messages.botAPI)}
                    />
                  </div>
                  {errors.botAPI && touched.botAPI && (
                    <div className="error">{errors.botAPI}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="chatId" className="text-label">
                  {intl.formatMessage(messages.chatId)}
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field
                      id="chatId"
                      name="chatId"
                      type="text"
                      placeholder={intl.formatMessage(messages.chatId)}
                    />
                  </div>
                  {errors.chatId && touched.chatId && (
                    <div className="error">{errors.chatId}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="sendSilently" className="checkbox-label">
                  <span>{intl.formatMessage(messages.sendSilently)}</span>
                  <span className="label-tip">
                    {intl.formatMessage(messages.sendSilentlyTip)}
                  </span>
                </label>
                <div className="form-input">
                  <Field
                    type="checkbox"
                    id="sendSilently"
                    name="sendSilently"
                  />
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

export default NotificationsTelegram;
