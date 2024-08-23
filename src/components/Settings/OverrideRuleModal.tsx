import Modal from '@app/components/Common/Modal';
import LanguageSelector from '@app/components/LanguageSelector';
import { GenreSelector } from '@app/components/Selector';
import type { DVRTestResponse } from '@app/components/Settings/SettingsServices';
import useSettings from '@app/hooks/useSettings';
import globalMessages from '@app/i18n/globalMessages';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import type OverrideRule from '@server/entity/OverrideRule';
import { Field, Formik } from 'formik';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import { useToasts } from 'react-toast-notifications';

const messages = defineMessages('components.Settings.RadarrModal', {
  createrule: 'New Override Rule',
  editrule: 'Edit Override Rule',
  create: 'Create rule',
  rootfolder: 'Root Folder',
  selectRootFolder: 'Select root folder',
  qualityprofile: 'Quality Profile',
  selectQualityProfile: 'Select quality profile',
  tags: 'Tags',
  notagoptions: 'No tags.',
  selecttags: 'Select tags',
  ruleCreated: 'Override rule created successfully!',
  ruleUpdated: 'Override rule updated successfully!',
});

type OptionType = {
  value: number;
  label: string;
};

interface OverrideRuleModalProps {
  rule: OverrideRule | null;
  onClose: () => void;
  testResponse: DVRTestResponse;
  radarrId?: number;
  sonarrId?: number;
}

const OverrideRuleModal = ({
  onClose,
  rule,
  testResponse,
  radarrId,
  sonarrId,
}: OverrideRuleModalProps) => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const { currentSettings } = useSettings();

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity ease-in-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-in-out duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Formik
        initialValues={{
          genre: rule?.genre,
          language: rule?.language,
          // keywords: [],
          profileId: rule?.profileId,
          rootFolder: rule?.rootFolder,
          tags: rule?.tags,
        }}
        onSubmit={async (values) => {
          try {
            const submission = {
              genre: values.genre || null,
              language: values.language || null,
              profileId: Number(values.profileId) || null,
              rootFolder: values.rootFolder || null,
              tags: values.tags || null,
              radarrServiceId: radarrId,
              sonarrServiceId: sonarrId,
            };
            if (!rule) {
              const res = await fetch('/api/v1/overrideRule', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission),
              });
              if (!res.ok) throw new Error();
              addToast(intl.formatMessage(messages.ruleCreated), {
                appearance: 'success',
                autoDismiss: true,
              });
            } else {
              const res = await fetch(`/api/v1/overrideRule/${rule.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission),
              });
              if (!res.ok) throw new Error();
              addToast(intl.formatMessage(messages.ruleUpdated), {
                appearance: 'success',
                autoDismiss: true,
              });
            }
            onClose();
          } catch (e) {
            // set error here
          }
        }}
      >
        {({
          errors,
          touched,
          values,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => {
          return (
            <Modal
              onCancel={onClose}
              okButtonType="primary"
              okText={
                isSubmitting
                  ? intl.formatMessage(globalMessages.saving)
                  : rule
                  ? intl.formatMessage(globalMessages.save)
                  : intl.formatMessage(messages.create)
              }
              okDisabled={
                isSubmitting ||
                !isValid ||
                (!values.genre && !values.language) ||
                (!values.rootFolder && !values.profileId && !values.tags)
              }
              onOk={() => handleSubmit()}
              title={
                !rule
                  ? intl.formatMessage(messages.createrule)
                  : intl.formatMessage(messages.editrule)
              }
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold leading-8 text-gray-100">
                  Condition
                </h3>
                <div className="form-row">
                  <label htmlFor="genre" className="text-label">
                    Genres
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <GenreSelector
                        type="movie"
                        defaultValue={values.genre}
                        isMulti
                        onChange={(genres) => {
                          setFieldValue(
                            'genre',
                            genres?.map((v) => v.value).join(',')
                          );
                        }}
                      />
                    </div>
                    {errors.genre &&
                      touched.genre &&
                      typeof errors.genre === 'string' && (
                        <div className="error">{errors.genre}</div>
                      )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="language" className="text-label">
                    Language
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <LanguageSelector
                        value={values.language}
                        serverValue={currentSettings.originalLanguage}
                        isUserSettings
                        setFieldValue={(_key, value) => {
                          setFieldValue('language', value);
                        }}
                      />
                    </div>
                    {errors.genre &&
                      touched.genre &&
                      typeof errors.genre === 'string' && (
                        <div className="error">{errors.genre}</div>
                      )}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold leading-8 text-gray-100">
                  Settings
                </h3>
                <div className="form-row">
                  <label htmlFor="rootFolderRule" className="text-label">
                    {intl.formatMessage(messages.rootfolder)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field as="select" id="rootFolderRule" name="rootFolder">
                        <option value="">
                          {intl.formatMessage(messages.selectRootFolder)}
                        </option>
                        {testResponse.rootFolders.length > 0 &&
                          testResponse.rootFolders.map((folder) => (
                            <option
                              key={`loaded-profile-${folder.id}`}
                              value={folder.path}
                            >
                              {folder.path}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.rootFolder &&
                      touched.rootFolder &&
                      typeof errors.rootFolder === 'string' && (
                        <div className="error">{errors.rootFolder}</div>
                      )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="profileIdRule" className="text-label">
                    {intl.formatMessage(messages.qualityprofile)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field as="select" id="profileIdRule" name="profileId">
                        <option value="">
                          {intl.formatMessage(messages.selectQualityProfile)}
                        </option>
                        {testResponse.profiles.length > 0 &&
                          testResponse.profiles.map((profile) => (
                            <option
                              key={`loaded-profile-${profile.id}`}
                              value={profile.id}
                            >
                              {profile.name}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.profileId &&
                      touched.profileId &&
                      typeof errors.profileId === 'string' && (
                        <div className="error">{errors.profileId}</div>
                      )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="tags" className="text-label">
                    {intl.formatMessage(messages.tags)}
                  </label>
                  <div className="form-input-area">
                    <Select<OptionType, true>
                      options={testResponse.tags.map((tag) => ({
                        label: tag.label,
                        value: tag.id,
                      }))}
                      isMulti
                      placeholder={intl.formatMessage(messages.selecttags)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={
                        (values?.tags
                          ?.map((tagId) => {
                            const foundTag = testResponse.tags.find(
                              (tag) => tag.id === Number(tagId)
                            );

                            if (!foundTag) {
                              return undefined;
                            }

                            return {
                              value: foundTag.id,
                              label: foundTag.label,
                            };
                          })
                          .filter(
                            (option) => option !== undefined
                          ) as OptionType[]) || []
                      }
                      onChange={(value) => {
                        setFieldValue(
                          'tags',
                          value.map((option) => option.value)
                        );
                      }}
                      noOptionsMessage={() =>
                        intl.formatMessage(messages.notagoptions)
                      }
                    />
                  </div>
                </div>
              </div>
            </Modal>
          );
        }}
      </Formik>
    </Transition>
  );
};

export default OverrideRuleModal;
