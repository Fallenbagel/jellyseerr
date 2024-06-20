import { isMobile } from 'react-device-detect';

const jellyfinIosUrl = 'org.jellyfin.expo://';

export const urlLink = (plexUrl: string | undefined): string => {
  if (isMobile)
    return jellyfinIosUrl + plexUrl?.replace(new RegExp('^.*(details\\?)'), '');
  return `${plexUrl}`;
};
