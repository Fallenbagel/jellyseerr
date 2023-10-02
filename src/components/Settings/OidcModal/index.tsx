import Modal from '@app/components/Common/Modal';
import globalMessages from '@app/i18n/globalMessages';
import { Transition } from '@headlessui/react';
import type { MainSettings } from '@server/lib/settings';
import {
  ErrorMessage,
  Field,
  type FormikErrors,
  type FormikHelpers,
} from 'formik';
import {
  defineMessages,
  useIntl,
  type IntlShape,
  type MessageDescriptor,
} from 'react-intl';
import * as yup from 'yup';

const messages = defineMessages({
  configureoidc: 'Configure OpenID Connect',
  oidcDomain: 'Issuer URL',
  oidcDomainTip: "The base URL of the identity provider's OIDC endpoint",
  oidcName: 'Provider Name',
  oidcNameTip: 'Name of the OIDC Provider which appears on the login screen',
  oidcClientId: 'Client ID',
  oidcClientIdTip: 'The OIDC Client ID assigned to Jellyseerr',
  oidcClientSecret: 'Client Secret',
  oidcClientSecretTip: 'The OIDC Client Secret assigned to Jellyseerr',
  oidcMatchUsername: 'Allow {mediaServerName} Usernames',
  oidcMatchUsernameTip:
    'Match OIDC users with their {mediaServerName} accounts by username',
});

type OidcSettings = MainSettings['oidc'];

interface OidcModalProps {
  values: Partial<OidcSettings>;
  errors?: FormikErrors<OidcSettings>;
  setFieldValue: FormikHelpers<OidcSettings>['setFieldValue'];
  mediaServerName: string;
  onClose?: () => void;
  onOk?: () => void;
}

export const oidcSettingsSchema = (intl: IntlShape) => {
  const requiredMessage = (message: MessageDescriptor) =>
    intl.formatMessage(globalMessages.fieldRequired, {
      fieldName: intl.formatMessage(message),
    });

  return yup.object().shape({
    providerName: yup.string().required(requiredMessage(messages.oidcName)),
    providerUrl: yup
      .string()
      .required(requiredMessage(messages.oidcDomain))
      .test({
        message: 'Must be a valid domain without query string parameters.',
        test: (val) => {
          return (
            !!val &&
            // Any HTTP(S) domain without query string
            /^(https?:\/\/)([A-Za-z0-9-_.!~*'():]*)(((?!\?).)*$)/i.test(val)
          );
        },
      }),
    clientId: yup.string().required(requiredMessage(messages.oidcClientId)),
    clientSecret: yup
      .string()
      .required(requiredMessage(messages.oidcClientSecret)),
  });
};

const OidcModal = ({
  onClose,
  onOk,
  values,
  errors,
  setFieldValue,
  mediaServerName,
}: OidcModalProps) => {
  const intl = useIntl();

  const canClose = (errors: OidcModalProps['errors']) => {
    if (errors == null) return true;
    return Object.keys(errors).length === 0;
  };

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
      <Modal
        onCancel={onClose}
        cancelButtonAction="button"
        okButtonType="primary"
        okButtonAction="button"
        okDisabled={!canClose(errors)}
        okText={intl.formatMessage(globalMessages.done)}
        onOk={onOk}
        title={intl.formatMessage(messages.configureoidc)}
      >
        <div className="mb-6">
          <div className="form-row">
            <label htmlFor="oidcDomain" className="text-label">
              {intl.formatMessage(messages.oidcDomain)}
              <span className="label-required">*</span>
              <span className="label-tip">
                {intl.formatMessage(messages.oidcDomainTip)}
              </span>
            </label>
            <div className="form-input-area">
              <Field id="oidcDomain" name="oidc.providerUrl" type="text" />
              <ErrorMessage
                className="error"
                component="span"
                name="oidc.providerUrl"
              />
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="oidcName" className="text-label">
              {intl.formatMessage(messages.oidcName)}
              <span className="label-required">*</span>
              <span className="label-tip">
                {intl.formatMessage(messages.oidcNameTip)}
              </span>
            </label>
            <div className="form-input-area">
              <Field id="oidcName" name="oidc.providerName" type="text" />
              <ErrorMessage
                className="error"
                component="span"
                name="oidc.providerName"
              />
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="oidcClientId" className="text-label">
              {intl.formatMessage(messages.oidcClientId)}
              <span className="label-required">*</span>
              <span className="label-tip">
                {intl.formatMessage(messages.oidcClientIdTip)}
              </span>
            </label>
            <div className="form-input-area">
              <Field id="oidcClientId" name="oidc.clientId" type="text" />
              <ErrorMessage
                className="error"
                component="span"
                name="oidc.clientId"
              />
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="oidcClientSecret" className="text-label">
              {intl.formatMessage(messages.oidcClientSecret)}
              <span className="label-required">*</span>
              <span className="label-tip">
                {intl.formatMessage(messages.oidcClientSecretTip)}
              </span>
            </label>
            <div className="form-input-area">
              <Field
                id="oidcClientSecret"
                name="oidc.clientSecret"
                type="text"
              />
              <ErrorMessage
                className="error"
                component="span"
                name="oidc.clientSecret"
              />
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="oidcMatchUsername" className="checkbox-label">
              {intl.formatMessage(messages.oidcMatchUsername, {
                mediaServerName,
              })}
              <span className="label-tip">
                {intl.formatMessage(messages.oidcMatchUsernameTip, {
                  mediaServerName,
                })}
              </span>
            </label>
            <div className="form-input-area">
              <Field
                type="checkbox"
                id="oidcMatchUsername"
                name="oidc.matchJellyfinUsername"
                onChange={() => {
                  setFieldValue(
                    'oidc.matchJellyfinUsername',
                    !values.matchJellyfinUsername
                  );
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </Transition>
  );
};

export default OidcModal;
