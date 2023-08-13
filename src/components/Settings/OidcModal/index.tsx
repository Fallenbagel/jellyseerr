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
import { defineMessages, useIntl } from 'react-intl';
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

const OIDC_SETTINGS_OPTIONS = [
  'oidcName',
  'oidcClientId',
  'oidcClientSecret',
  'oidcDomain',
  'oidcMatchUsername',
] as const;

type OidcSettings = Pick<MainSettings, typeof OIDC_SETTINGS_OPTIONS[number]>;

interface OidcModalProps {
  values: Partial<OidcSettings>;
  errors: FormikErrors<OidcSettings>;
  setFieldValue: FormikHelpers<OidcSettings>['setFieldValue'];
  mediaServerName: string;
  onClose?: () => void;
  onOk?: () => void;
}

export const OidcSettingsSchema = yup.object().shape({
  oidcName: yup.string().when('oidcLogin', {
    is: true,
    then: yup.string().required(),
  }),
  oidcClientId: yup.string().when('oidcLogin', {
    is: true,
    then: yup.string().required(),
  }),
  oidcClientSecret: yup.string().when('oidcLogin', {
    is: true,
    then: yup.string().required(),
  }),
  oidcDomain: yup.string().when('oidcLogin', {
    is: true,
    then: yup
      .string()
      .required()
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
  }),
});

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
    return Object.keys(errors).some((err) =>
      (OIDC_SETTINGS_OPTIONS as readonly string[]).includes(err)
    );
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
        okDisabled={canClose(errors)}
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
              <Field id="oidcDomain" name="oidcDomain" type="text" />
              <ErrorMessage
                className="error"
                component="span"
                name="oidcDomain"
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
              <Field id="oidcName" name="oidcName" type="text" />
              <ErrorMessage
                className="error"
                component="span"
                name="oidcName"
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
              <Field id="oidcClientId" name="oidcClientId" type="text" />
              <ErrorMessage
                className="error"
                component="span"
                name="oidcClientId"
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
                name="oidcClientSecret"
                type="text"
              />
              <ErrorMessage
                className="error"
                component="span"
                name="oidcClientSecret"
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
                name="oidcMatchUsername"
                onChange={() => {
                  setFieldValue('oidcMatchUsername', !values.oidcMatchUsername);
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
