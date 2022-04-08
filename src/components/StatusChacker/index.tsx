import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import Modal from '../Common/Modal';
import Transition from '../Transition';

const messages = defineMessages({
  newversionavailable: 'New Version Available',
  newversionDescription:
    'An update is now available. Click the button below to reload the application.',
  reloadOverseerr: 'Reload Jellyseerr',
});

const StatusChecker: React.FC = () => {
  const intl = useIntl();
  const { data, error } = useSWR<{ version: string; commitTag: string }>(
    '/api/v1/status',
    {
      refreshInterval: 60 * 1000,
    }
  );

  if (!data && !error) {
    return null;
  }

  if (!data) {
    return null;
  }

  return null;
};

export default StatusChecker;
