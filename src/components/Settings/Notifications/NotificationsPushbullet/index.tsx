import { BeakerIcon, SaveIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import * as Yup from 'yup';
import globalMessages from '../../../../i18n/globalMessages';
import Button from '../../../Common/Button';
import LoadingSpinner from '../../../Common/LoadingSpinner';
import SensitiveInput from '../../../Common/SensitiveInput';
import NotificationTypeSelector from '../../../NotificationTypeSelector';

const messages = defineMessages({
  agentEnabled: 'Enable Agent',
  accessToken: 'Access Token',
  accessTokenTip:
    'Create a token from your <PushbulletSettingsLink>Account Settings</PushbulletSettingsLink>',
  validationAccessTokenRequired: 'You must provide an access token',
  pushbulletSettingsSaved:
    'Pushbullet notification settings saved successfully!',
  pushbulletSettingsFailed: 'Pushbullet notification settings failed to save.',
  toastPushbulletTestSending: 'Sending Pushbullet test notification…',
  toastPushbulletTestSuccess: 'Pushbullet test notification sent!',
  toastPushbulletTestFailed: 'Pushbullet test notification failed to send.',
  validationTypes: 'You must select at least one notification type',
});

const NotificationsPushbullet: React.FC = () => {
  const intl = useIntl();
  const { addToast, removeToast } = useToasts();
  const [isTesting, setIsTesting] = useState(false);
  const { data, error, revalidate } = useSWR(
    '/api/v1/settings/notifications/pushbullet'
  );

  const NotificationsPushbulletSchema = Yup.object().shape({
    accessToken: Yup.string().when('enabled', {
      is: true,
      then: Yup.string()
        .nullable()
        .required(intl.formatMessage(messages.validationAccessTokenRequired)),
      otherwise: Yup.string().nullable(),
    }),
    types: Yup.number().when('enabled', {
      is: true,
      then: Yup.number()
        .nullable()
        .moreThan(0, intl.formatMessage(messages.validationTypes)),
      otherwise: Yup.number().nullable(),
    }),
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
      {({
        errors,
        touched,
        isSubmitting,
        values,
        isValid,
        setFieldValue,
        setFieldTouched,
      }) => {
        const testSettings = async () => {
          setIsTesting(true);
          let toastId: string | undefined;
          try {
            addToast(
              intl.formatMessage(messages.toastPushbulletTestSending),
              {
                autoDismiss: false,
                appearance: 'info',
              },
              (id) => {
                toastId = id;
              }
            );
            await axios.post('/api/v1/settings/notifications/pushbullet/test', {
              enabled: true,
              types: values.types,
              options: {
                accessToken: values.accessToken,
              },
            });

            if (toastId) {
              removeToast(toastId);
            }
            addToast(intl.formatMessage(messages.toastPushbulletTestSuccess), {
              autoDismiss: true,
              appearance: 'success',
            });
          } catch (e) {
            if (toastId) {
              removeToast(toastId);
            }
            addToast(intl.formatMessage(messages.toastPushbulletTestFailed), {
              autoDismiss: true,
              appearance: 'error',
            });
          } finally {
            setIsTesting(false);
          }
        };

        return (
          <Form className="section">
            <div className="form-row">
              <label htmlFor="enabled" className="checkbox-label">
                {intl.formatMessage(messages.agentEnabled)}
                <span className="label-required">*</span>
              </label>
              <div className="form-input">
                <Field type="checkbox" id="enabled" name="enabled" />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="accessToken" className="text-label">
                {intl.formatMessage(messages.accessToken)}
                <span className="label-required">*</span>
                <span className="label-tip">
                  {intl.formatMessage(messages.accessTokenTip, {
                    PushbulletSettingsLink: function PushbulletSettingsLink(
                      msg
                    ) {
                      return (
                        <a
                          href="https://www.pushbullet.com/#settings/account"
                          className="text-white transition duration-300 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {msg}
                        </a>
                      );
                    },
                  })}
                </span>
              </label>
              <div className="form-input">
                <div className="form-input-field">
                  <SensitiveInput
                    as="field"
                    id="accessToken"
                    name="accessToken"
                    autoComplete="one-time-code"
                  />
                </div>
                {errors.accessToken && touched.accessToken && (
                  <div className="error">{errors.accessToken}</div>
                )}
              </div>
            </div>
            <NotificationTypeSelector
              currentTypes={values.enabled ? values.types : 0}
              onUpdate={(newTypes) => {
                setFieldValue('types', newTypes);
                setFieldTouched('types');

                if (newTypes) {
                  setFieldValue('enabled', true);
                }
              }}
              error={
                errors.types && touched.types
                  ? (errors.types as string)
                  : undefined
              }
            />
            <div className="actions">
              <div className="flex justify-end">
                <span className="inline-flex ml-3 rounded-md shadow-sm">
                  <Button
                    buttonType="warning"
                    disabled={isSubmitting || !isValid || isTesting}
                    onClick={(e) => {
                      e.preventDefault();
                      testSettings();
                    }}
                  >
                    <BeakerIcon />
                    <span>
                      {isTesting
                        ? intl.formatMessage(globalMessages.testing)
                        : intl.formatMessage(globalMessages.test)}
                    </span>
                  </Button>
                </span>
                <span className="inline-flex ml-3 rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    disabled={isSubmitting || !isValid || isTesting}
                  >
                    <SaveIcon />
                    <span>
                      {isSubmitting
                        ? intl.formatMessage(globalMessages.saving)
                        : intl.formatMessage(globalMessages.save)}
                    </span>
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

export default NotificationsPushbullet;
