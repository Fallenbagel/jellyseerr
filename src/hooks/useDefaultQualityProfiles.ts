import type {
  ServiceCommonServer,
  ServiceCommonServerWithDetails,
} from '@server/interfaces/api/serviceInterfaces';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const useServerDefaultQualityProfiles = (
  data: ServiceCommonServer[] | undefined,
  type: 'movie' | 'tv',
  is4k = false
): [ServiceCommonServer | null, ServiceCommonServerWithDetails | undefined] => {
  const [selectedServer, setSelectedServer] =
    useState<ServiceCommonServer | null>(null);
  const { data: serverData } = useSWR<ServiceCommonServerWithDetails>(
    selectedServer !== null
      ? `/api/v1/service/${type === 'movie' ? 'radarr' : 'sonarr'}/${
          selectedServer.id
        }`
      : null
  );

  useEffect(() => {
    const defaultServer = data?.find(
      (server) => server.isDefault && is4k === server.is4k
    );

    if (defaultServer && defaultServer.id !== selectedServer?.id) {
      setSelectedServer(defaultServer);
    }
  }, [data, is4k, selectedServer?.id]);

  return [selectedServer, serverData];
};

const useDefaultQualityProfiles = (type: 'movie' | 'tv') => {
  const { data } = useSWR<ServiceCommonServer[]>(
    `/api/v1/service/${type === 'movie' ? 'radarr' : 'sonarr'}`,
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  const [server, details] = useServerDefaultQualityProfiles(data, type);
  const [server4k, details4k] = useServerDefaultQualityProfiles(
    data,
    type,
    true
  );

  return { server, details, server4k, details4k };
};

export default useDefaultQualityProfiles;
