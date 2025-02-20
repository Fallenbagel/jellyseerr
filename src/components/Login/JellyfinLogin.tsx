import Button from '@app/components/Common/Button';
import SensitiveInput from '@app/components/Common/SensitiveInput';
import useSettings from '@app/hooks/useSettings';
import defineMessages from '@app/utils/defineMessages';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { ApiErrorCode } from '@server/constants/error';
import { MediaServerType, ServerType } from '@server/constants/server';
import { Field, Form, Formik } from 'formik';
import { useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import * as Yup from 'yup';

const messages = defineMessages('components.Login', {
  loginwithapp: 'Login with {appName}',
  username: 'Username',
  password: 'Password',
  validationusernamerequired: 'Username required',
  validationpasswordrequired: 'Password required',
  loginerror: 'Something went wrong while trying to sign in.',
  adminerror: 'You must use an admin account to sign in.',
  noadminerror: 'No admin user found on the server.',
  credentialerror: 'The username or password is incorrect.',
  invalidurlerror: 'Unable to connect to {mediaServerName} server.',
  signingin: 'Signing In…',
  signin: 'Sign In',
  forgotpassword: 'Forgot Password?',
});

interface JellyfinLoginProps {
  revalidate: () => void;
  serverType?: MediaServerType;
}

const JellyfinLogin: React.FC<JellyfinLoginProps> = ({
  revalidate,
  serverType,
}) => {
  const toasts = useToasts();
  const intl = useIntl();
  const settings = useSettings();

  const mediaServerFormatValues = {
    mediaServerName:
      serverType === MediaServerType.JELLYFIN
        ? ServerType.JELLYFIN
        : serverType === MediaServerType.EMBY
        ? ServerType.EMBY
        : 'Media Server',
  };

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(
      intl.formatMessage(messages.validationusernamerequired)
    ),
    password: Yup.string(),
  });
  const baseUrl = settings.currentSettings.jellyfinExternalHost
    ? settings.currentSettings.jellyfinExternalHost
    : settings.currentSettings.jellyfinHost;
  const jellyfinForgotPasswordUrl =
    settings.currentSettings.jellyfinForgotPasswordUrl;

  return (
    <div>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const res = await fetch('/api/v1/auth/jellyfin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: values.username,
                password: values.password,
                email: values.username,
              }),
            });
            if (!res.ok) throw new Error(res.statusText, { cause: res });
          } catch (e) {
            let errorData;
            try {
              errorData = await e.cause?.text();
              errorData = JSON.parse(errorData);
            } catch {
              /* empty */
            }
            let errorMessage = null;
            switch (errorData?.message) {
              case ApiErrorCode.InvalidUrl:
                errorMessage = messages.invalidurlerror;
                break;
              case ApiErrorCode.InvalidCredentials:
                errorMessage = messages.credentialerror;
                break;
              case ApiErrorCode.NotAdmin:
                errorMessage = messages.adminerror;
                break;
              case ApiErrorCode.NoAdminUser:
                errorMessage = messages.noadminerror;
                break;
              default:
                errorMessage = messages.loginerror;
                break;
            }
            toasts.addToast(
              intl.formatMessage(errorMessage, mediaServerFormatValues),
              {
                autoDismiss: true,
                appearance: 'error',
              }
            );
          } finally {
            revalidate();
          }
        }}
      >
        {({ errors, touched, isSubmitting, isValid }) => {
          return (
            <>
              <Form>
                <div>
                  <h2 className="mb-6 -mt-1 text-center text-lg font-bold text-neutral-200">
                    {intl.formatMessage(messages.loginwithapp, {
                      appName: mediaServerFormatValues.mediaServerName,
                    })}
                  </h2>

                  <div className="mt-1 mb-4">
                    <div className="form-input-field">
                      <Field
                        id="username"
                        name="username"
                        type="text"
                        placeholder={intl.formatMessage(messages.username)}
                        className="!bg-gray-700/80 placeholder:text-gray-400"
                      />
                    </div>
                    {errors.username && touched.username && (
                      <div className="error">{errors.username}</div>
                    )}
                  </div>

                  <div className="mt-1 mb-2">
                    <div className="form-input-field">
                      <SensitiveInput
                        as="field"
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder={intl.formatMessage(messages.password)}
                        className="!bg-gray-700/80 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex">
                      {errors.password && touched.password && (
                        <div className="error">{errors.password}</div>
                      )}
                      <div className="flex-grow"></div>
                      {baseUrl && (
                        <a
                          href={
                            jellyfinForgotPasswordUrl
                              ? `${jellyfinForgotPasswordUrl}`
                              : `${baseUrl}/web/index.html#!/${
                                  settings.currentSettings.mediaServerType ===
                                  MediaServerType.EMBY
                                    ? 'startup/'
                                    : ''
                                }forgotpassword.html`
                          }
                          className="pt-2 text-sm text-indigo-500 hover:text-indigo-400"
                        >
                          {intl.formatMessage(messages.forgotpassword)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  buttonType="primary"
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="mt-2 w-full shadow-sm"
                >
                  <ArrowLeftOnRectangleIcon />
                  <span>
                    {isSubmitting
                      ? intl.formatMessage(messages.signingin)
                      : intl.formatMessage(messages.signin)}
                  </span>
                </Button>
              </Form>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

export default JellyfinLogin;
