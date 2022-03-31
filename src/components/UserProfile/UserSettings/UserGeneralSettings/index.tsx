import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import { Language } from '../../../../../server/lib/settings';
import { MediaServerType } from '../../../../../server/constants/server';
import useSettings from '../../../../hooks/useSettings';
import { UserType, useUser } from '../../../../hooks/useUser';
import Error from '../../../../pages/_error';
import Badge from '../../../Common/Badge';
import Button from '../../../Common/Button';
import LoadingSpinner from '../../../Common/LoadingSpinner';
import RegionSelector from '../../../RegionSelector';

const messages = defineMessages({
  generalsettings: 'General Settings',
  displayName: 'Display Name',
  save: 'Save Changes',
  saving: 'Saving…',
  mediaServerUser: '{mediaServerName} User',
  localuser: 'Local User',
  toastSettingsSuccess: 'Settings successfully saved!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  region: 'Discover Region',
  regionTip:
    'Filter content by region (only applies to the "Popular" and "Upcoming" categories)',
  originallanguage: 'Discover Language',
  originallanguageTip:
    'Filter content by original language (only applies to the "Popular" and "Upcoming" categories)',
  originalLanguageDefault: 'All Languages',
  languageServerDefault: '{applicationTitle} Default ({language})',
});

const UserGeneralSettings: React.FC = () => {
  const intl = useIntl();
  const settings = useSettings();
  const { addToast } = useToasts();
  const router = useRouter();
  const { user, mutate } = useUser({ id: Number(router.query.userId) });
  const { currentSettings } = useSettings();
  const { data, error, revalidate } = useSWR<{
    username?: string;
    region?: string;
    originalLanguage?: string;
  }>(user ? `/api/v1/user/${user?.id}/settings/main` : null);

  const { data: languages, error: languagesError } = useSWR<Language[]>(
    '/api/v1/languages'
  );

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!languages && !languagesError) {
    return <LoadingSpinner />;
  }

  if (!data || !languages) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.generalsettings)}
        </h3>
      </div>
      <Formik
        initialValues={{
          displayName: data?.username,
          region: data?.region,
          originalLanguage: data?.originalLanguage,
        }}
        enableReinitialize
        onSubmit={async (values) => {
          try {
            await axios.post(`/api/v1/user/${user?.id}/settings/main`, {
              username: values.displayName,
              region: values.region,
              originalLanguage: values.originalLanguage,
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
            mutate();
          }
        }}
      >
        {({ errors, touched, isSubmitting, values, setFieldValue }) => {
          return (
            <Form className="section">
              <div className="form-row">
                <div className="text-label">Account Type</div>
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
                <label htmlFor="displayName" className="text-label">
                  {intl.formatMessage(messages.displayName)}
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder={user?.displayName}
                    />
                  </div>
                  {errors.displayName && touched.displayName && (
                    <div className="error">{errors.displayName}</div>
                  )}
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
                  <RegionSelector
                    name="region"
                    value={values.region ?? ''}
                    isUserSetting
                    onChange={setFieldValue}
                  />
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
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <Field
                      as="select"
                      id="originalLanguage"
                      name="originalLanguage"
                    >
                      <option value="">
                        {intl.formatMessage(messages.languageServerDefault, {
                          applicationTitle: currentSettings.applicationTitle,
                          language:
                            intl.formatDisplayName(
                              currentSettings.originalLanguage,
                              {
                                type: 'language',
                                fallback: 'none',
                              }
                            ) ?? currentSettings.originalLanguage,
                        })}
                      </option>
                      <option value="all">
                        {intl.formatMessage(messages.originalLanguageDefault)}
                      </option>
                      {languages?.map((language) => (
                        <option
                          key={`language-key-${language.iso_639_1}`}
                          value={language.iso_639_1}
                        >
                          {intl.formatDisplayName(language.iso_639_1, {
                            type: 'language',
                            fallback: 'none',
                          }) ?? language.english_name}
                        </option>
                      ))}
                    </Field>
                  </div>
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

export default UserGeneralSettings;
