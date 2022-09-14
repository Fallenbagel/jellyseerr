import Spinner from '@app/assets/spinner.svg';
import Badge from '@app/components/Common/Badge';
import Tooltip from '@app/components/Common/Tooltip';
import useSettings from '@app/hooks/useSettings';
import { Permission, useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
import { MediaStatus } from '@server/constants/media';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  status: '{status}',
  status4k: '4K {status}',
  playonplex: 'Play on Plex',
  openinarr: 'Open in {arr}',
  managemedia: 'Manage {mediaType}',
});

interface StatusBadgeProps {
  status?: MediaStatus;
  is4k?: boolean;
  inProgress?: boolean;
  plexUrl?: string;
  serviceUrl?: string;
  tmdbId?: number;
  mediaType?: 'movie' | 'tv';
}

const StatusBadge = ({
  status,
  is4k = false,
  inProgress = false,
  plexUrl,
  serviceUrl,
  tmdbId,
  mediaType,
}: StatusBadgeProps) => {
  const intl = useIntl();
  const { hasPermission } = useUser();
  const settings = useSettings();

  let mediaLink: string | undefined;
  let mediaLinkDescription: string | undefined;

  if (
    mediaType &&
    plexUrl &&
    hasPermission(
      is4k
        ? [
            Permission.REQUEST_4K,
            mediaType === 'movie'
              ? Permission.REQUEST_4K_MOVIE
              : Permission.REQUEST_4K_TV,
          ]
        : [
            Permission.REQUEST,
            mediaType === 'movie'
              ? Permission.REQUEST_MOVIE
              : Permission.REQUEST_TV,
          ],
      {
        type: 'or',
      }
    ) &&
    (!is4k ||
      (mediaType === 'movie'
        ? settings.currentSettings.movie4kEnabled
        : settings.currentSettings.series4kEnabled))
  ) {
    mediaLink = plexUrl;
    mediaLinkDescription = intl.formatMessage(messages.playonplex);
  } else if (hasPermission(Permission.MANAGE_REQUESTS)) {
    if (mediaType && tmdbId) {
      mediaLink = `/${mediaType}/${tmdbId}?manage=1`;
      mediaLinkDescription = intl.formatMessage(messages.managemedia, {
        mediaType: intl.formatMessage(
          mediaType === 'movie' ? globalMessages.movie : globalMessages.tvshow
        ),
      });
    } else if (hasPermission(Permission.ADMIN)) {
      mediaLink = serviceUrl;
      mediaLinkDescription = intl.formatMessage(messages.openinarr, {
        arr: mediaType === 'movie' ? 'Radarr' : 'Sonarr',
      });
    }
  }

  switch (status) {
    case MediaStatus.AVAILABLE:
      return (
        <Tooltip content={mediaLinkDescription}>
          <Badge badgeType="success" href={mediaLink}>
            <div className="flex items-center">
              <span>
                {intl.formatMessage(
                  is4k ? messages.status4k : messages.status,
                  {
                    status: intl.formatMessage(globalMessages.available),
                  }
                )}
              </span>
              {inProgress && <Spinner className="ml-1 h-3 w-3" />}
            </div>
          </Badge>
        </Tooltip>
      );

    case MediaStatus.PARTIALLY_AVAILABLE:
      return (
        <Tooltip content={mediaLinkDescription}>
          <Badge badgeType="success" href={mediaLink}>
            <div className="flex items-center">
              <span>
                {intl.formatMessage(
                  is4k ? messages.status4k : messages.status,
                  {
                    status: intl.formatMessage(
                      globalMessages.partiallyavailable
                    ),
                  }
                )}
              </span>
              {inProgress && <Spinner className="ml-1 h-3 w-3" />}
            </div>
          </Badge>
        </Tooltip>
      );

    case MediaStatus.PROCESSING:
      return (
        <Tooltip content={mediaLinkDescription}>
          <Badge badgeType="primary" href={mediaLink}>
            <div className="flex items-center">
              <span>
                {intl.formatMessage(
                  is4k ? messages.status4k : messages.status,
                  {
                    status: inProgress
                      ? intl.formatMessage(globalMessages.processing)
                      : intl.formatMessage(globalMessages.requested),
                  }
                )}
              </span>
              {inProgress && <Spinner className="ml-1 h-3 w-3" />}
            </div>
          </Badge>
        </Tooltip>
      );

    case MediaStatus.PENDING:
      return (
        <Tooltip content={mediaLinkDescription}>
          <Badge badgeType="warning" href={mediaLink}>
            {intl.formatMessage(is4k ? messages.status4k : messages.status, {
              status: intl.formatMessage(globalMessages.pending),
            })}
          </Badge>
        </Tooltip>
      );

    default:
      return null;
  }
};

export default StatusBadge;
