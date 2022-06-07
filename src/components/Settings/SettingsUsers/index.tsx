import { SaveIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';
import { MediaServerType } from '../../../../server/constants/server';
import type { MainSettings } from '../../../../server/lib/settings';
import useSettings from '../../../hooks/useSettings';
import globalMessages from '../../../i18n/globalMessages';
import Button from '../../Common/Button';
import LoadingSpinner from '../../Common/LoadingSpinner';
import PageTitle from '../../Common/PageTitle';
import PermissionEdit from '../../PermissionEdit';
import QuotaSelector from '../../QuotaSelector';
import getConfig from 'next/config';

const messages = defineMessages({
  users: 'Users',
  userSettings: 'User Settings',
  userSettingsDescription: 'Configure global and default user settings.',
  toastSettingsSuccess: 'User settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  loginMethods: 'Login Methods',
  loginMethodsTip: 'Configure login methods for users.',
  combinedLogin: 'Combined Login',
  combinedLoginTip: 'Allow users to login with their local and jellyfin login.',
  localLogin: 'Enable Local Sign-In',
  localLoginTip:
    "Allow users to sign in using their email address and password, instead of Jellyfin's built-in sign-in.",
  newPlexLogin: 'Enable New {mediaServerName} Sign-In',
  newPlexLoginTip:
    'Allow {mediaServerName} users to sign in without first being imported',
  jellyfinLogin: 'Enable Jellyfin Sign-In',
  jellyfinLoginTip: 'Allow users to sign in using their Jellyfin account.',
  movieRequestLimitLabel: 'Global Movie Request Limit',
  tvRequestLimitLabel: 'Global Series Request Limit',
  defaultPermissions: 'Default Permissions',
  defaultPermissionsTip: 'Initial permissions assigned to new users',
});

const SettingsUsers: React.FC = () => {
  const { addToast } = useToasts();
  const intl = useIntl();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<MainSettings>('/api/v1/settings/main');
  const settings = useSettings();
  const { publicRuntimeConfig } = getConfig();

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.users),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">{intl.formatMessage(messages.userSettings)}</h3>
        <p className="description">
          {intl.formatMessage(messages.userSettingsDescription)}
        </p>
      </div>
      <div className="section">
        <Formik
          initialValues={{
            combinedLogin: data?.combinedLogin,
            localLogin: data?.localLogin,
            newPlexLogin: data?.newPlexLogin,
            jellyfinLogin: data?.jellyfinLogin,
            movieQuotaLimit: data?.defaultQuotas.movie.quotaLimit ?? 0,
            movieQuotaDays: data?.defaultQuotas.movie.quotaDays ?? 7,
            tvQuotaLimit: data?.defaultQuotas.tv.quotaLimit ?? 0,
            tvQuotaDays: data?.defaultQuotas.tv.quotaDays ?? 7,
            defaultPermissions: data?.defaultPermissions ?? 0,
          }}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await axios.post('/api/v1/settings/main', {
                localLogin: values.localLogin,
                newPlexLogin: values.newPlexLogin,
                combinedLogin: values.combinedLogin,
                jellyfinLogin: values.jellyfinLogin,
                defaultQuotas: {
                  movie: {
                    quotaLimit: values.movieQuotaLimit,
                    quotaDays: values.movieQuotaDays,
                  },
                  tv: {
                    quotaLimit: values.tvQuotaLimit,
                    quotaDays: values.tvQuotaDays,
                  },
                },
                defaultPermissions: values.defaultPermissions,
              });
              mutate('/api/v1/settings/public');

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
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => {
            return (
              <Form className="section">
                <div
                  className="form-row"
                  role={`group`}
                  aria-label={`login-group`}
                >
                  <label htmlFor="localLogin" className={`checkbox-label`}>
                    {intl.formatMessage(messages.loginMethods)}
                    <span className="label-tip">
                      {intl.formatMessage(messages.loginMethodsTip)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <div className={`max-w-lg`}>
                      {/*Combined local and Jellyfin sign-in*/}
                      <div
                        className={`relative mt-4 flex items-start first:mt-0`}
                      >
                        <div className={`flex h-6 items-center`}>
                          <Field
                            type="checkbox"
                            id="combinedLogin"
                            name="combinedLogin"
                            onChange={() => {
                              setFieldValue(
                                'combinedLogin',
                                !values.combinedLogin
                              );
                              setFieldValue(
                                'localLogin',
                                !values.combinedLogin
                              );
                              setFieldValue(
                                'jellyfinLogin',
                                !values.combinedLogin
                              );
                            }}
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor={`combinedLogin`} className="block">
                            <div className="flex flex-col">
                              <span className="font-medium text-white">
                                {intl.formatMessage(messages.combinedLogin)}
                              </span>
                              <span className="font-normal text-gray-400">
                                {intl.formatMessage(messages.combinedLoginTip)}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                      {/*Local sign-in*/}
                      <div className={`mt-4 pl-10`}>
                        <div
                          className={`relative mt-4 flex items-start first:mt-0 ${
                            values.combinedLogin ? 'disabled opacity-50' : ''
                          }`}
                        >
                          <div className="flex h-6 items-center">
                            <Field
                              type="checkbox"
                              id="localLogin"
                              name="localLogin"
                              onChange={() => {
                                setFieldValue('localLogin', !values.localLogin);
                              }}
                              disabled={values.combinedLogin}
                            />
                          </div>
                          <div className="ml-3 text-sm leading-6">
                            <label htmlFor="localLogin" className="block">
                              <div className="flex flex-col">
                                <span className="font-medium text-white">
                                  {intl.formatMessage(messages.localLogin)}
                                </span>
                                <span className="font-normal text-gray-400">
                                  {intl.formatMessage(messages.localLoginTip)}
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                      {/*Jellyfin signin*/}
                      <div className={`mt-4 pl-10`}>
                        <div
                          className={`relative mt-4 flex items-start first:mt-0 ${
                            values.combinedLogin ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex h-6 items-center">
                            <Field
                              type="checkbox"
                              id="jellyfinLogin"
                              name="jellyfinLogin"
                              onChange={() => {
                                setFieldValue(
                                  'jellyfinLogin',
                                  !values.jellyfinLogin
                                );
                              }}
                              disabled={values.combinedLogin}
                            />
                          </div>
                          <div className="ml-3 text-sm leading-6">
                            <label htmlFor="jellyfinLogin" className="block">
                              <div className="flex flex-col">
                                <span className="font-medium text-white">
                                  {intl.formatMessage(messages.jellyfinLogin)}
                                </span>
                                <span className="font-normal text-gray-400">
                                  {intl.formatMessage(
                                    messages.jellyfinLoginTip
                                  )}
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="newPlexLogin" className="checkbox-label">
                    {intl.formatMessage(messages.newPlexLogin, {
                      mediaServerName:
                        publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                          ? 'Emby'
                          : settings.currentSettings.mediaServerType ===
                            MediaServerType.PLEX
                          ? 'Plex'
                          : 'Jellyfin',
                    })}
                    <span className="label-tip">
                      {intl.formatMessage(messages.newPlexLoginTip, {
                        mediaServerName:
                          publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                            ? 'Emby'
                            : settings.currentSettings.mediaServerType ===
                              MediaServerType.PLEX
                            ? 'Plex'
                            : 'Jellyfin',
                      })}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="newPlexLogin"
                      name="newPlexLogin"
                      onChange={() => {
                        setFieldValue('newPlexLogin', !values.newPlexLogin);
                      }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="applicationTitle" className="text-label">
                    {intl.formatMessage(messages.movieRequestLimitLabel)}
                  </label>
                  <div className="form-input-area">
                    <QuotaSelector
                      onChange={setFieldValue}
                      dayFieldName="movieQuotaDays"
                      limitFieldName="movieQuotaLimit"
                      mediaType="movie"
                      defaultDays={values.movieQuotaDays}
                      defaultLimit={values.movieQuotaLimit}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="applicationTitle" className="text-label">
                    {intl.formatMessage(messages.tvRequestLimitLabel)}
                  </label>
                  <div className="form-input-area">
                    <QuotaSelector
                      onChange={setFieldValue}
                      dayFieldName="tvQuotaDays"
                      limitFieldName="tvQuotaLimit"
                      mediaType="tv"
                      defaultDays={values.tvQuotaDays}
                      defaultLimit={values.tvQuotaLimit}
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
                      {intl.formatMessage(messages.defaultPermissions)}
                      <span className="label-tip">
                        {intl.formatMessage(messages.defaultPermissionsTip)}
                      </span>
                    </span>
                    <div className="form-input-area">
                      <div className="max-w-lg">
                        <PermissionEdit
                          currentPermission={values.defaultPermissions}
                          onUpdate={(newPermissions) =>
                            setFieldValue('defaultPermissions', newPermissions)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <div className="flex justify-end">
                    <span className="ml-3 inline-flex rounded-md shadow-sm">
                      <Button
                        buttonType="primary"
                        type="submit"
                        disabled={isSubmitting}
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
      </div>
    </>
  );
};

export default SettingsUsers;
