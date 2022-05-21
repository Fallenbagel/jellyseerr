import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MediaStatus } from '../../../server/constants/media';
import Spinner from '../../assets/spinner.svg';
import useSettings from '../../hooks/useSettings';
import { Permission, useUser } from '../../hooks/useUser';
import globalMessages from '../../i18n/globalMessages';
import Badge from '../Common/Badge';

const messages = defineMessages({
  status: '{status}',
  status4k: '4K {status}',
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

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  is4k = false,
  inProgress = false,
  plexUrl,
  serviceUrl,
  tmdbId,
  mediaType,
}) => {
  const intl = useIntl();
  const { hasPermission } = useUser();
  const settings = useSettings();

  let mediaLink: string | undefined;

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
  } else if (hasPermission(Permission.MANAGE_REQUESTS)) {
    mediaLink =
      mediaType && tmdbId ? `/${mediaType}/${tmdbId}?manage=1` : serviceUrl;
  }

  switch (status) {
    case MediaStatus.AVAILABLE:
      return (
        <Badge badgeType="success" href={mediaLink}>
          <div className="flex items-center">
            <span>
              {intl.formatMessage(is4k ? messages.status4k : messages.status, {
                status: intl.formatMessage(globalMessages.available),
              })}
            </span>
            {inProgress && <Spinner className="ml-1 h-3 w-3" />}
          </div>
        </Badge>
      );

    case MediaStatus.PARTIALLY_AVAILABLE:
      return (
        <Badge badgeType="success" href={mediaLink}>
          <div className="flex items-center">
            <span>
              {intl.formatMessage(is4k ? messages.status4k : messages.status, {
                status: intl.formatMessage(globalMessages.partiallyavailable),
              })}
            </span>
            {inProgress && <Spinner className="ml-1 h-3 w-3" />}
          </div>
        </Badge>
      );

    case MediaStatus.PROCESSING:
      return (
        <Badge badgeType="primary" href={mediaLink}>
          <div className="flex items-center">
            <span>
              {intl.formatMessage(is4k ? messages.status4k : messages.status, {
                status: inProgress
                  ? intl.formatMessage(globalMessages.processing)
                  : intl.formatMessage(globalMessages.requested),
              })}
            </span>
            {inProgress && <Spinner className="ml-1 h-3 w-3" />}
          </div>
        </Badge>
      );

    case MediaStatus.PENDING:
      return (
        <Badge badgeType="warning" href={mediaLink}>
          {intl.formatMessage(is4k ? messages.status4k : messages.status, {
            status: intl.formatMessage(globalMessages.pending),
          })}
        </Badge>
      );

    default:
      return null;
  }
};

export default StatusBadge;
