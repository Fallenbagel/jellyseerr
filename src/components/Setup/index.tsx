import EmbyLogo from '@app/assets/services/emby.svg';
import JellyfinLogo from '@app/assets/services/jellyfin.svg';
import PlexLogo from '@app/assets/services/plex.svg';
import AppDataWarning from '@app/components/AppDataWarning';
import Button from '@app/components/Common/Button';
import ImageFader from '@app/components/Common/ImageFader';
import PageTitle from '@app/components/Common/PageTitle';
import LanguagePicker from '@app/components/Layout/LanguagePicker';
import SettingsJellyfin from '@app/components/Settings/SettingsJellyfin';
import SettingsPlex from '@app/components/Settings/SettingsPlex';
import SettingsServices from '@app/components/Settings/SettingsServices';
import SetupSteps from '@app/components/Setup/SetupSteps';
import useLocale from '@app/hooks/useLocale';
import useSettings from '@app/hooks/useSettings';
import defineMessages from '@app/utils/defineMessages';
import { MediaServerType } from '@server/constants/server';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWR, { mutate } from 'swr';
import SetupLogin from './SetupLogin';

const messages = defineMessages('components.Setup', {
  welcome: 'Welcome to Jellyseerr',
  subtitle: 'Get started by choosing your media server',
  configjellyfin: 'Configure Jellyfin',
  configplex: 'Configure Plex',
  configemby: 'Configure Emby',
  setup: 'Setup',
  finish: 'Finish Setup',
  finishing: 'Finishing…',
  continue: 'Continue',
  servertype: 'Choose Server Type',
  signin: 'Sign In',
  configuremediaserver: 'Configure Media Server',
  configureservices: 'Configure Services',
});

const Setup = () => {
  const intl = useIntl();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [mediaServerSettingsComplete, setMediaServerSettingsComplete] =
    useState(false);
  const [mediaServerType, setMediaServerType] = useState(
    MediaServerType.NOT_CONFIGURED
  );
  const router = useRouter();
  const { locale } = useLocale();
  const settings = useSettings();

  const finishSetup = async () => {
    setIsUpdating(true);
    const res = await fetch('/api/v1/settings/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error();
    const data: { initialized: boolean } = await res.json();

    setIsUpdating(false);
    if (data.initialized) {
      const mainRes = await fetch('/api/v1/settings/main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale }),
      });
      if (!mainRes.ok) throw new Error();

      mutate('/api/v1/settings/public');
      router.push('/');
    }
  };

  const { data: backdrops } = useSWR<string[]>('/api/v1/backdrops', {
    refreshInterval: 0,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (settings.currentSettings.initialized) {
      router.push('/');
    }
    if (
      settings.currentSettings.mediaServerType !==
      MediaServerType.NOT_CONFIGURED
    ) {
      setCurrentStep(3);
      setMediaServerType(settings.currentSettings.mediaServerType);
    }
  }, [
    settings.currentSettings.mediaServerType,
    settings.currentSettings.initialized,
    router,
  ]);

  if (settings.currentSettings.initialized) return <></>;

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gray-900 py-12">
      <PageTitle title={intl.formatMessage(messages.setup)} />
      <ImageFader
        backgroundImages={
          backdrops?.map(
            (backdrop) => `https://image.tmdb.org/t/p/original${backdrop}`
          ) ?? []
        }
      />
      <div className="absolute top-4 right-4 z-50">
        <LanguagePicker />
      </div>
      <div className="relative z-40 px-4 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="relative mb-10 h-48 max-w-full sm:mx-auto sm:h-64 sm:max-w-md">
          <Image src="/logo_stacked.svg" alt="Logo" fill />
        </div>
        <AppDataWarning />
        <nav className="relative z-50">
          <ul
            className="divide-y divide-gray-600 rounded-md border border-gray-600 bg-gray-800 bg-opacity-50 md:flex md:divide-y-0"
            style={{ backdropFilter: 'blur(5px)' }}
          >
            <SetupSteps
              stepNumber={1}
              description={intl.formatMessage(messages.servertype)}
              active={currentStep === 1}
              completed={currentStep > 1}
            />
            <SetupSteps
              stepNumber={2}
              description={intl.formatMessage(messages.signin)}
              active={currentStep === 2}
              completed={currentStep > 2}
            />
            <SetupSteps
              stepNumber={3}
              description={intl.formatMessage(messages.configuremediaserver)}
              active={currentStep === 3}
              completed={currentStep > 3}
            />
            <SetupSteps
              stepNumber={4}
              description={intl.formatMessage(messages.configureservices)}
              active={currentStep === 4}
              isLastStep
            />
          </ul>
        </nav>
        <div className="mt-10 w-full rounded-md border border-gray-600 bg-gray-800 bg-opacity-50 p-4 text-white">
          {currentStep === 1 && (
            <div className="flex flex-col items-center pb-6">
              <div className="mb-2 flex justify-center text-xl font-bold">
                {intl.formatMessage(messages.welcome)}
              </div>
              <div className="mb-2 flex justify-center pb-6 text-sm">
                {intl.formatMessage(messages.subtitle)}
              </div>
              <div className="grid grid-cols-3">
                <div className="flex flex-col divide-y divide-gray-600 rounded-l border border-gray-600 py-2">
                  <div className="mb-2 flex flex-1 items-center justify-center py-2 px-2">
                    <JellyfinLogo className="h-10" />
                  </div>
                  <div className="px-2 pt-2">
                    <button
                      onClick={() => {
                        setMediaServerType(MediaServerType.JELLYFIN);
                        setCurrentStep(2);
                      }}
                      className="button-md relative z-10 inline-flex h-full w-full items-center justify-center rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:z-20 hover:border-gray-200 focus:z-20 focus:border-gray-100 focus:outline-none active:border-gray-100"
                    >
                      {intl.formatMessage(messages.configjellyfin)}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col divide-y divide-gray-600 border-y border-gray-600 py-2">
                  <div className="mb-2 flex flex-1 items-center justify-center py-2 px-2">
                    <PlexLogo className="h-8" />
                  </div>
                  <div className="px-2 pt-2">
                    <button
                      onClick={() => {
                        setMediaServerType(MediaServerType.PLEX);
                        setCurrentStep(2);
                      }}
                      className="button-md relative z-10 inline-flex h-full w-full items-center justify-center rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:z-20 hover:border-gray-200 focus:z-20 focus:border-gray-100 focus:outline-none active:border-gray-100"
                    >
                      {intl.formatMessage(messages.configplex)}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col divide-y divide-gray-600 rounded-r border border-gray-600 py-2">
                  <div className="mb-2 flex flex-1 items-center justify-center py-2 px-2">
                    <EmbyLogo className="h-9" />
                  </div>
                  <div className="px-2 pt-2">
                    <button
                      onClick={() => {
                        setMediaServerType(MediaServerType.EMBY);
                        setCurrentStep(2);
                      }}
                      className="button-md relative z-10 inline-flex h-full w-full items-center justify-center rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:z-20 hover:border-gray-200 focus:z-20 focus:border-gray-100 focus:outline-none active:border-gray-100"
                    >
                      {intl.formatMessage(messages.configemby)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <SetupLogin
              serverType={mediaServerType}
              onCancel={() => {
                setMediaServerType(MediaServerType.NOT_CONFIGURED);
                setCurrentStep(1);
              }}
              onComplete={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 3 && (
            <div className="p-2">
              {mediaServerType === MediaServerType.PLEX ? (
                <SettingsPlex
                  onComplete={() => setMediaServerSettingsComplete(true)}
                />
              ) : (
                <SettingsJellyfin
                  isSetupSettings
                  onComplete={() => setMediaServerSettingsComplete(true)}
                />
              )}
              <div className="actions">
                <div className="flex justify-end">
                  <span className="ml-3 inline-flex rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      disabled={!mediaServerSettingsComplete}
                      onClick={() => setCurrentStep(4)}
                    >
                      {intl.formatMessage(messages.continue)}
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
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
