import React from 'react';
import useSWR from 'swr';
import { StatusResponse } from '../../../server/interfaces/api/settingsInterfaces';

const StatusChecker: React.FC = () => {
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
