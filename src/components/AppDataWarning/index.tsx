import Alert from '@app/components/Common/Alert';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages({
  dockerVolumeMissingDescription:
    'The <code>{appDataPath}</code> volume mount was not configured properly. All data will be cleared when the container is stopped or restarted.',
});

const AppDataWarning = () => {
  const intl = useIntl();
  const { data, error } = useSWR<{ appData: boolean; appDataPath: string }>(
    '/api/v1/status/appdata'
  );

  if (!data && !error) {
    return null;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      {!data.appData && (
        <Alert
          title={intl.formatMessage(messages.dockerVolumeMissingDescription, {
            code: (msg: React.ReactNode) => (
              <code className="bg-opacity-50">{msg}</code>
            ),
            appDataPath: data.appDataPath,
          })}
        />
      )}
    </>
  );
};

export default AppDataWarning;
