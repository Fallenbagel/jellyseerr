import { SaveIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import { MediaServerType } from '../../../../../server/constants/server';
import { UserSettingsGeneralResponse } from '../../../../../server/interfaces/api/userSettingsInterfaces';
import {
  availableLanguages,
  AvailableLocale,
} from '../../../../context/LanguageContext';
import useLocale from '../../../../hooks/useLocale';
import useSettings from '../../../../hooks/useSettings';
import { Permission, UserType, useUser } from '../../../../hooks/useUser';
import globalMessages from '../../../../i18n/globalMessages';
import Error from '../../../../pages/_error';
import Badge from '../../../Common/Badge';
import Button from '../../../Common/Button';
import LoadingSpinner from '../../../Common/LoadingSpinner';
import PageTitle from '../../../Common/PageTitle';
import LanguageSelector from '../../../LanguageSelector';
import QuotaSelector from '../../../QuotaSelector';
import RegionSelector from '../../../RegionSelector';

const messages = defineMessages({
  general: 'General',
  generalsettings: 'General Settings',
  displayName: 'Display Name',
  save: 'Save Changes',
  saving: 'Saving…',
  mediaServerUser: '{mediaServerName} User',
  accounttype: 'Account Type',
  plexuser: 'Plex User',
  localuser: 'Local User',
  role: 'Role',
  owner: 'Owner',
  admin: 'Admin',
  user: 'User',
  toastSettingsSuccess: 'Settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  region: 'Discover Region',
  regionTip: 'Filter content by regional availability',
  originallanguage: 'Discover Language',
  originallanguageTip: 'Filter content by original language',
  movierequestlimit: 'Movie Request Limit',
  seriesrequestlimit: 'Series Request Limit',
  enableOverride: 'Override Global Limit',
  applanguage: 'Display Language',
  languageDefault: 'Default ({language})',
});

const UserGeneralSettings: React.FC = () => {
  const intl = useIntl();
  const settings = useSettings();
  const { addToast } = useToasts();
  const { locale, setLocale } = useLocale();
  const [movieQuotaEnabled, setMovieQuotaEnabled] = useState(false);
  const [tvQuotaEnabled, setTvQuotaEnabled] = useState(false);
  const router = useRouter();
  const { user, hasPermission, mutate } = useUser({
    id: Number(router.query.userId),
  });
  const { user: currentUser, hasPermission: currentHasPermission } = useUser();
  const { currentSettings } = useSettings();
  const { data, error, revalidate } = useSWR<UserSettingsGeneralResponse>(
    user ? `/api/v1/user/${user?.id}/settings/main` : null
  );

  useEffect(() => {
    setMovieQuotaEnabled(
      data?.movieQuotaLimit != undefined && data?.movieQuotaDays != undefined
    );
    setTvQuotaEnabled(
      data?.tvQuotaLimit != undefined && data?.tvQuotaDays != undefined
    );
  }, [data]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.general),
          intl.formatMessage(globalMessages.usersettings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.generalsettings)}
        </h3>
      </div>
      <Formik
        initialValues={{
          locale: data?.locale,
          displayName: data?.username,
          region: data?.region,
          originalLanguage: data?.originalLanguage,
          movieQuotaLimit: data?.movieQuotaLimit,
          movieQuotaDays: data?.movieQuotaDays,
          tvQuotaLimit: data?.tvQuotaLimit,
          tvQuotaDays: data?.tvQuotaDays,
        }}
        enableReinitialize
        onSubmit={async (values) => {
          try {
            await axios.post(`/api/v1/user/${user?.id}/settings/main`, {
              username: values.displayName,
              region: values.region,
              originalLanguage: values.originalLanguage,
              movieQuotaLimit: movieQuotaEnabled
                ? values.movieQuotaLimit
                : null,
              movieQuotaDays: movieQuotaEnabled ? values.movieQuotaDays : null,
              tvQuotaLimit: tvQuotaEnabled ? values.tvQuotaLimit : null,
              tvQuotaDays: tvQuotaEnabled ? values.tvQuotaDays : null,
              locale: values.locale,
            });

            if (currentUser?.id === user?.id && setLocale) {
              setLocale(
                (values.locale
                  ? values.locale
                  : currentSettings.locale) as AvailableLocale
              );
            }

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
            mutate();
          }
        }}
      >
        {({ errors, touched, isSubmitting, values, setFieldValue }) => {
          return (
            <Form className="section">
              <div className="form-row">
                <label className="text-label">
                  {intl.formatMessage(messages.accounttype)}
                </label>
                <div className="mb-1 text-sm font-medium leading-5 text-gray-400 sm:mt-2">
                  <div className="flex items-center max-w-lg">
                    {user?.userType === UserType.LOCAL ? (
                      <Badge badgeType="warning">
                        {intl.formatMessage(messages.localuser)}
                      </Badge>
                    ) : (
                      <Badge badgeType="default">
                        {intl.formatMessage(messages.mediaServerUser, {
                          mediaServerName:
                            settings.currentSettings.mediaServerType ===
                            MediaServerType.PLEX
                              ? 'Plex'
                              : 'Jellyfin',
                        })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label className="text-label">
                  {intl.formatMessage(messages.role)}
                </label>
                <div className="mb-1 text-sm font-medium leading-5 text-gray-400 sm:mt-2">
                  <div className="flex items-center max-w-lg">
                    {user?.id === 1
                      ? intl.formatMessage(messages.owner)
                      : hasPermission(Permission.ADMIN)
                      ? intl.formatMessage(messages.admin)
                      : intl.formatMessage(messages.user)}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="displayName" className="text-label">
                  {intl.formatMessage(messages.displayName)}
                </label>
                <div className="form-input">
                  <div className="form-input-field">
                    <Field
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder={
                        user?.plexUsername ? user.plexUsername : user?.email
                      }
                    />
                  </div>
                  {errors.displayName && touched.displayName && (
                    <div className="error">{errors.displayName}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="locale" className="text-label">
                  {intl.formatMessage(messages.applanguage)}
                </label>
                <div className="form-input">
                  <div className="form-input-field">
                    <Field as="select" id="locale" name="locale">
                      <option value="" lang={locale}>
                        {intl.formatMessage(messages.languageDefault, {
                          language:
                            availableLanguages[currentSettings.locale].display,
                        })}
                      </option>
                      {(
                        Object.keys(
                          availableLanguages
                        ) as (keyof typeof availableLanguages)[]
                      ).map((key) => (
                        <option
                          key={key}
                          value={availableLanguages[key].code}
                          lang={availableLanguages[key].code}
                        >
                          {availableLanguages[key].display}
                        </option>
                      ))}
                    </Field>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="displayName" className="text-label">
                  <span>{intl.formatMessage(messages.region)}</span>
                  <span className="label-tip">
                    {intl.formatMessage(messages.regionTip)}
                  </span>
                </label>
                <div className="form-input">
                  <div className="form-input-field">
                    <RegionSelector
                      name="region"
                      value={values.region ?? ''}
                      isUserSetting
                      onChange={setFieldValue}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="originalLanguage" className="text-label">
                  <span>{intl.formatMessage(messages.originallanguage)}</span>
                  <span className="label-tip">
                    {intl.formatMessage(messages.originallanguageTip)}
                  </span>
                </label>
                <div className="form-input">
                  <div className="form-input-field">
                    <LanguageSelector
                      setFieldValue={setFieldValue}
                      serverValue={currentSettings.originalLanguage}
                      value={values.originalLanguage}
                      isUserSettings
                    />
                  </div>
                </div>
              </div>
              {currentHasPermission(Permission.MANAGE_USERS) &&
                !hasPermission(Permission.MANAGE_USERS) && (
                  <>
                    <div className="form-row">
                      <label htmlFor="movieQuotaLimit" className="text-label">
                        <span>
                          {intl.formatMessage(messages.movierequestlimit)}
                        </span>
                      </label>
                      <div className="form-input">
                        <div className="flex flex-col">
                          <div className="flex items-center mb-4">
                            <input
                              type="checkbox"
                              checked={movieQuotaEnabled}
                              onChange={() => setMovieQuotaEnabled((s) => !s)}
                            />
                            <span className="ml-2 text-gray-300">
                              {intl.formatMessage(messages.enableOverride)}
                            </span>
                          </div>
                          <QuotaSelector
                            isDisabled={!movieQuotaEnabled}
                            dayFieldName="movieQuotaDays"
                            limitFieldName="movieQuotaLimit"
                            mediaType="movie"
                            onChange={setFieldValue}
                            defaultDays={values.movieQuotaDays}
                            defaultLimit={values.movieQuotaLimit}
                            dayOverride={
                              !movieQuotaEnabled
                                ? data?.globalMovieQuotaDays
                                : undefined
                            }
                            limitOverride={
                              !movieQuotaEnabled
                                ? data?.globalMovieQuotaLimit
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <label htmlFor="tvQuotaLimit" className="text-label">
                        <span>
                          {intl.formatMessage(messages.seriesrequestlimit)}
                        </span>
                      </label>
                      <div className="form-input">
                        <div className="flex flex-col">
                          <div className="flex items-center mb-4">
                            <input
                              type="checkbox"
                              checked={tvQuotaEnabled}
                              onChange={() => setTvQuotaEnabled((s) => !s)}
                            />
                            <span className="ml-2 text-gray-300">
                              {intl.formatMessage(messages.enableOverride)}
                            </span>
                          </div>
                          <QuotaSelector
                            isDisabled={!tvQuotaEnabled}
                            dayFieldName="tvQuotaDays"
                            limitFieldName="tvQuotaLimit"
                            mediaType="tv"
                            onChange={setFieldValue}
                            defaultDays={values.tvQuotaDays}
                            defaultLimit={values.tvQuotaLimit}
                            dayOverride={
                              !tvQuotaEnabled
                                ? data?.globalTvQuotaDays
                                : undefined
                            }
                            limitOverride={
                              !tvQuotaEnabled
                                ? data?.globalTvQuotaLimit
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              <div className="actions">
                <div className="flex justify-end">
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
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
    </>
  );
};

export default UserGeneralSettings;
