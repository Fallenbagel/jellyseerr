import Accordion from '@app/components/Common/Accordion';
import Modal from '@app/components/Common/Modal';
import globalMessages from '@app/i18n/globalMessages';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
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
  oidcScopes: 'Scopes',
  oidcScopesTip: 'The scopes to request from the identity provider.',
  oidcIdentificationClaims: 'Identification Claims',
  oidcIdentificationClaimsTip:
    'OIDC claims to use as unique identifiers for the given user. Will be matched ' +
    "against the user's email and, optionally, their media server username.",
  oidcRequiredClaims: 'Required Claims',
  oidcRequiredClaimsTip: 'Claims that are required for a user to log in.',
  oidcMatchUsername: 'Allow {mediaServerName} Usernames',
  oidcMatchUsernameTip:
    'Match OIDC users with their {mediaServerName} accounts by username',
  oidcAutomaticLogin: 'Automatic Login',
  oidcAutomaticLoginTip:
    'Automatically navigate to the OIDC login and logout pages. This functionality ' +
    'only supported when OIDC is the exclusive login method.',
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
      .url('Issuer URL must be a valid URL.')
      .test({
        message: 'Issuer URL may not have search parameters.',
        test: (val) => {
          if (!val) return false;
          try {
            const url = new URL(val);
            return url.search === '';
          } catch {
            return false;
          }
        },
      })
      .test({
        message: 'Issuer URL protocol must be http / https.',
        test: (val) => {
          if (!val) return false;
          try {
            const url = new URL(val);
            return ['http:', 'https:'].includes(url.protocol);
          } catch {
            return false;
          }
        },
      }),
    clientId: yup.string().required(requiredMessage(messages.oidcClientId)),
    clientSecret: yup
      .string()
      .required(requiredMessage(messages.oidcClientSecret)),
    scopes: yup.string().required(requiredMessage(messages.oidcScopes)),
    userIdentifier: yup
      .string()
      .required(requiredMessage(messages.oidcIdentificationClaims)),
    requiredClaims: yup.string(),
    matchJellyfinUsername: yup.boolean(),
    automaticLogin: yup.boolean(),
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
        <div className="mb-6 overflow-auto md:max-h-[75vh]">
          <div className="px-3">
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
          </div>
          <Accordion single>
            {({ openIndexes, handleClick, AccordionContent }) => (
              <>
                <button
                  className={`mt-4 flex w-full cursor-pointer justify-between rounded-md bg-opacity-70 p-3 text-gray-400 hover:bg-gray-700 ${
                    openIndexes.includes(0) ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleClick(0)}
                >
                  <span className="text-md font-semibold">Advanced</span>
                  <ChevronDownIcon
                    width={20}
                    className={` transition-transform duration-200 ${
                      openIndexes.includes(0) ? 'rotate-0' : 'rotate-90'
                    }`}
                  />
                </button>
                <AccordionContent isOpen={openIndexes.includes(0)}>
                  <div className="px-3">
                    <div className="form-row">
                      <label htmlFor="oidcScopes" className="text-label">
                        {intl.formatMessage(messages.oidcScopes)}
                        <span className="label-required">*</span>
                        <span className="label-tip">
                          {intl.formatMessage(messages.oidcScopesTip)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field id="oidcScopes" name="oidc.scopes" type="text" />
                        <ErrorMessage
                          className="error"
                          component="span"
                          name="oidc.scopes"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <label
                        htmlFor="oidcIdentificationClaims"
                        className="text-label"
                      >
                        {intl.formatMessage(messages.oidcIdentificationClaims)}
                        <span className="label-required">*</span>
                        <span className="label-tip">
                          {intl.formatMessage(
                            messages.oidcIdentificationClaimsTip
                          )}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field
                          id="oidcIdentificationClaims"
                          name="oidc.userIdentifier"
                          type="text"
                        />
                        <ErrorMessage
                          className="error"
                          component="span"
                          name="oidc.userIdentifier"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <label
                        htmlFor="oidcRequiredClaims"
                        className="text-label"
                      >
                        {intl.formatMessage(messages.oidcRequiredClaims)}
                        <span className="label-required">*</span>
                        <span className="label-tip">
                          {intl.formatMessage(messages.oidcRequiredClaimsTip)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field
                          id="oidcRequiredClaims"
                          name="oidc.requiredClaims"
                          type="text"
                        />
                        <ErrorMessage
                          className="error"
                          component="span"
                          name="oidc.requiredClaims"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <label
                        htmlFor="oidcMatchUsername"
                        className="checkbox-label"
                      >
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
                    <div className="form-row">
                      <label
                        htmlFor="oidcAutomaticLogin"
                        className="checkbox-label"
                      >
                        {intl.formatMessage(messages.oidcAutomaticLogin)}
                        <span className="label-tip">
                          {intl.formatMessage(messages.oidcAutomaticLoginTip)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field
                          type="checkbox"
                          id="oidcAutomaticLogin"
                          name="oidc.automaticLogin"
                          onChange={() => {
                            setFieldValue(
                              'oidc.automaticLogin',
                              !values.automaticLogin
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </>
            )}
          </Accordion>
        </div>
      </Modal>
    </Transition>
  );
};

export default OidcModal;
