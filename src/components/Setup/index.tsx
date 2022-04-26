import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR, { mutate } from 'swr';
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
  const [mediaServerSettingsComplete, setMediaServerSettingsComplete] =
    useState(false);
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
  const { data: backdrops } = useSWR<string[]>('/api/v1/backdrops', {
    refreshInterval: 0,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
  });

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gray-900 py-12">
      <PageTitle title={intl.formatMessage(messages.setup)} />
      <ImageFader
        backgroundImages={
          backdrops?.map(
            (backdrop) => `https://www.themoviedb.org/t/p/original${backdrop}`
          ) ?? []
        }
      />
      <div className="absolute top-4 right-4 z-50">
        <LanguagePicker />
      </div>
      <div className="relative z-40 px-4 sm:mx-auto sm:w-full sm:max-w-4xl">
        <img
          src="/logo_stacked.svg"
          className="mb-10 max-w-full sm:mx-auto sm:max-w-md"
          alt="Logo"
        />
        <AppDataWarning />
        <nav className="relative z-50">
          <ul
            className="divide-y divide-gray-600 rounded-md border border-gray-600 bg-gray-800 bg-opacity-50 md:flex md:divide-y-0"
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
        <div className="mt-10 w-full rounded-md border border-gray-600 bg-gray-800 bg-opacity-50 p-4 text-white">
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
                  showAdvancedSettings={false}
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
                  <span className="ml-3 inline-flex rounded-md shadow-sm">
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
                  <span className="ml-3 inline-flex rounded-md shadow-sm">
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
