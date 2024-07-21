import Alert from '@app/components/Common/Alert';
import Modal from '@app/components/Common/Modal';
import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import { RequestError } from '@app/types/error';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';

const messages = defineMessages(
  'components.UserProfile.UserSettings.LinkJellyfinModal',
  {
    title: 'Link Jellyfin Account',
    description:
      'Enter your Jellyfin credentials to link your account with Jellyseerr.',
    username: 'Username',
    password: 'Password',
    usernameRequired: 'You must provide a username',
    passwordRequired: 'You must provide a password',
    saving: 'Adding…',
    save: 'Link',
    errorUnauthorized: 'Unable to connect to Jellyfin using your credentials',
    errorExists: 'This account is already linked to a Jellyseerr user',
    errorUnknown: 'An unknown error occurred',
  }
);

interface LinkJellyfinModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

const LinkJellyfinModal: React.FC<LinkJellyfinModalProps> = ({
  show,
  onClose,
  onSave,
}) => {
  const intl = useIntl();
  const settings = useSettings();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);

  const JellyfinLoginSchema = Yup.object().shape({
    username: Yup.string().required(
      intl.formatMessage(messages.usernameRequired)
    ),
    password: Yup.string().required(
      intl.formatMessage(messages.passwordRequired)
    ),
  });

  return (
    <Transition
      appear
      show={show}
      enter="transition ease-in-out duration-300 transform opacity-0"
      enterFrom="opacity-0"
      enterTo="opacuty-100"
      leave="transition ease-in-out duration-300 transform opacity-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={JellyfinLoginSchema}
        onSubmit={async ({ username, password }) => {
          try {
            setError(null);
            const res = await fetch(
              `/api/v1/user/${user?.id}/settings/linked-accounts/jellyfin`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  username,
                  password,
                }),
              }
            );
            if (!res.ok) throw new RequestError(res);

            onSave();
          } catch (e) {
            if (e instanceof RequestError && e.status == 401) {
              setError(intl.formatMessage(messages.errorUnauthorized));
            } else if (e instanceof RequestError && e.status == 422) {
              setError(intl.formatMessage(messages.errorExists));
            } else {
              setError(intl.formatMessage(messages.errorServer));
            }
          }
        }}
      >
        {({ errors, touched, handleSubmit, isSubmitting, isValid }) => {
          return (
            <Modal
              onCancel={() => {
                setError(null);
                onClose();
              }}
              okButtonType="primary"
              okButtonProps={{ type: 'submit', form: 'link-jellyfin-account' }}
              okText={
                isSubmitting
                  ? intl.formatMessage(messages.saving)
                  : intl.formatMessage(messages.save)
              }
              okDisabled={isSubmitting || !isValid}
              onOk={() => handleSubmit()}
              title={intl.formatMessage(messages.title)}
              dialogClass="sm:max-w-lg"
            >
              <Form id="link-jellyfin-account">
                {intl.formatMessage(messages.description, {
                  applicationName: settings.currentSettings.applicationTitle,
                })}
                {error && (
                  <div className="mt-2">
                    <Alert type="error">{error}</Alert>
                  </div>
                )}
                <label htmlFor="username" className="text-label">
                  {intl.formatMessage(messages.username)}
                </label>
                <div className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
                  <div className="flex rounded-md shadow-sm">
                    <Field
                      id="username"
                      name="username"
                      type="text"
                      placeholder={intl.formatMessage(messages.username)}
                    />
                  </div>
                  {errors.username && touched.username && (
                    <div className="error">{errors.username}</div>
                  )}
                </div>
                <label htmlFor="password" className="text-label">
                  {intl.formatMessage(messages.password)}
                </label>
                <div className="mt-1 mb-2 sm:col-span-2 sm:mt-0">
                  <div className="flex rounded-md shadow-sm">
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      placeholder={intl.formatMessage(messages.password)}
                    />
                  </div>
                  {errors.password && touched.password && (
                    <div className="error">{errors.password}</div>
                  )}
                </div>
              </Form>
            </Modal>
          );
        }}
      </Formik>
    </Transition>
  );
};

export default LinkJellyfinModal;
