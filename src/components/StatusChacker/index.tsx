import { SparklesIcon } from '@heroicons/react/outline';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { StatusResponse } from '../../../server/interfaces/api/settingsInterfaces';
import Modal from '../Common/Modal';
import Transition from '../Transition';

const messages = defineMessages({
  newversionavailable: 'Application Update',
  newversionDescription:
    'Overseerr has been updated! Please click the button below to reload the page.',
  reloadOverseerr: 'Reload',
});

const StatusChecker: React.FC = () => {
  const intl = useIntl();
  const { data, error } = useSWR<StatusResponse>('/api/v1/status', {
    refreshInterval: 60 * 1000,
  });

  if (!data && !error) {
    return null;
  }

  if (!data) {
    return null;
  }

  return null;
};

export default StatusChecker;
