import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { mutate } from 'swr';
import useLocale from '../../hooks/useLocale';
import AppDataWarning from '../AppDataWarning';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import ImageFader from '../Common/ImageFader';
import PageTitle from '../Common/PageTitle';
import LanguagePicker from '../Layout/LanguagePicker';
import SettingsJellyfin from '../Settings/SettingsJellyfin';
import SettingsPlex from '../Settings/SettingsPlex';
import SettingsServices from '../Settings/SettingsServices';
import SetupLogin from './SetupLogin';
import SetupSteps from './SetupSteps';

const messages = defineMessages({
  setup: 'Setup',
  finish: 'Finish Setup',
  finishing: 'Finishing…',
  continue: 'Continue',
  signin: 'Sign In',
  configuremediaserver: 'Configure Media Server',
  configureservices: 'Configure Services',
  tip: 'Tip',
  scanbackground:
    'Scanning will run in the background. You can continue the setup process in the meantime.',
});

const Setup: React.FC = () => {
  const intl = useIntl();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [
    mediaServerSettingsComplete,
    setMediaServerSettingsComplete,
  ] = useState(false);
  const [mediaServerType, setMediaServerType] = useState('');
  const router = useRouter();
  const { locale } = useLocale();

  const finishSetup = async () => {
    setIsUpdating(true);
    const response = await axios.post<{ initialized: boolean }>(
      '/api/v1/settings/initialize'
    );

    setIsUpdating(false);
    if (response.data.initialized) {
      await axios.post('/api/v1/settings/main', { locale });
      mutate('/api/v1/settings/public');

      router.push('/');
    }
  };

  const getMediaServerType = async () => {
    const MainSettings = await axios.get('/api/v1/settings/main');
    setMediaServerType(MainSettings.data.mediaServerType);
    return;
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen py-12 bg-gray-900">
      <PageTitle title={intl.formatMessage(messages.setup)} />
      <ImageFader
        backgroundImages={[
          '/images/rotate1.jpg',
          '/images/rotate2.jpg',
          '/images/rotate3.jpg',
          '/images/rotate4.jpg',
          '/images/rotate5.jpg',
          '/images/rotate6.jpg',
        ]}
      />
      <div className="absolute z-50 top-4 right-4">
        <LanguagePicker />
      </div>
      <div className="relative z-40 px-4 sm:mx-auto sm:w-full sm:max-w-4xl">
        <img
          src="/logo_stacked.svg"
          className="max-w-full mb-10 sm:max-w-md sm:mx-auto"
          alt="Logo"
        />
        <AppDataWarning />
        <nav className="relative z-50">
          <ul
            className="bg-gray-800 bg-opacity-50 border border-gray-600 divide-y divide-gray-600 rounded-md md:flex md:divide-y-0"
            style={{ backdropFilter: 'blur(5px)' }}
          >
            <SetupSteps
              stepNumber={1}
              description={intl.formatMessage(messages.signin)}
              active={currentStep === 1}
              completed={currentStep > 1}
            />
            <SetupSteps
              stepNumber={2}
              description={intl.formatMessage(messages.configuremediaserver)}
              active={currentStep === 2}
              completed={currentStep > 2}
            />
            <SetupSteps
              stepNumber={3}
              description={intl.formatMessage(messages.configureservices)}
              active={currentStep === 3}
              isLastStep
            />
          </ul>
        </nav>
        <div
          style={{ backdropFilter: 'blur(5px)' }}
          className="w-full p-4 mt-10 text-white bg-gray-800 border border-gray-600 rounded-md bg-opacity-40"
        >
          {currentStep === 1 && (
            <SetupLogin
              onComplete={() => {
                getMediaServerType().then(() => {
                  setCurrentStep(2);
                });
              }}
            />
          )}
          {currentStep === 2 && (
            <div>
              {mediaServerType == 'PLEX' ? (
                <SettingsPlex
                  onComplete={() => setMediaServerSettingsComplete(true)}
                />
              ) : (
                <SettingsJellyfin
                  onComplete={() => setMediaServerSettingsComplete(true)}
                />
              )}
              <div className="mt-4 text-sm text-gray-500">
                <span className="mr-2">
                  <Badge>{intl.formatMessage(messages.tip)}</Badge>
                </span>
                {intl.formatMessage(messages.scanbackground)}
              </div>
              <div className="actions">
                <div className="flex justify-end">
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      disabled={!mediaServerSettingsComplete}
                      onClick={() => setCurrentStep(3)}
                    >
                      {intl.formatMessage(messages.continue)}
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <SettingsServices />
              <div className="actions">
                <div className="flex justify-end">
                  <span className="inline-flex ml-3 rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      onClick={() => finishSetup()}
                      disabled={isUpdating}
                    >
                      {isUpdating
                        ? intl.formatMessage(messages.finishing)
                        : intl.formatMessage(messages.finish)}
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;
