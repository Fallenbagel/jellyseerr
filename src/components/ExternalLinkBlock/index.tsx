import React from 'react';
import { MediaType } from '../../../server/constants/media';
import { MediaServerType } from '../../../server/constants/server';
import ImdbLogo from '../../assets/services/imdb.svg';
import JellyfinLogo from '../../assets/services/jellyfin.svg';
import PlexLogo from '../../assets/services/plex.svg';
import RTLogo from '../../assets/services/rt.svg';
import TmdbLogo from '../../assets/services/tmdb.svg';
import TvdbLogo from '../../assets/services/tvdb.svg';
import useLocale from '../../hooks/useLocale';
import useSettings from '../../hooks/useSettings';

interface ExternalLinkBlockProps {
  mediaType: 'movie' | 'tv';
  tmdbId?: number;
  tvdbId?: number;
  imdbId?: string;
  rtUrl?: string;
  mediaUrl?: string;
}

const ExternalLinkBlock: React.FC<ExternalLinkBlockProps> = ({
  mediaType,
  tmdbId,
  tvdbId,
  imdbId,
  rtUrl,
  mediaUrl,
}) => {
  const settings = useSettings();
  const { locale } = useLocale();

  return (
    <div className="flex items-center justify-end">
      {mediaUrl && (
        <a
          href={mediaUrl}
          className={`${
            settings.currentSettings.mediaServerType === MediaServerType.PLEX
              ? 'w-8'
              : 'w-14'
          } mx-2 transition duration-300 opacity-50 hover:opacity-100`}
          target="_blank"
          rel="noreferrer"
        >
          {settings.currentSettings.mediaServerType === MediaServerType.PLEX ? (
            <PlexLogo />
          ) : (
            <JellyfinLogo />
          )}
        </a>
      )}
      {tmdbId && (
        <a
          href={`https://www.themoviedb.org/${mediaType}/${tmdbId}?language=${locale}`}
          className="w-8 transition duration-300 opacity-50 hover:opacity-100"
          target="_blank"
          rel="noreferrer"
        >
          <TmdbLogo />
        </a>
      )}
      {tvdbId && mediaType === MediaType.TV && (
        <a
          href={`http://www.thetvdb.com/?tab=series&id=${tvdbId}`}
          className="transition duration-300 opacity-50 w-9 hover:opacity-100"
          target="_blank"
          rel="noreferrer"
        >
          <TvdbLogo />
        </a>
      )}
      {imdbId && (
        <a
          href={`https://www.imdb.com/title/${imdbId}`}
          className="w-8 transition duration-300 opacity-50 hover:opacity-100"
          target="_blank"
          rel="noreferrer"
        >
          <ImdbLogo />
        </a>
      )}
      {rtUrl && (
        <a
          href={`${rtUrl}`}
          className="transition duration-300 opacity-50 w-14 hover:opacity-100"
          target="_blank"
          rel="noreferrer"
        >
          <RTLogo />
        </a>
      )}
    </div>
  );
};

export default ExternalLinkBlock;
