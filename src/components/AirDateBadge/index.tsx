import Badge from '@app/components/Common/Badge';
import defineMessages from '@app/utils/defineMessages';
import { FormattedRelativeTime, useIntl } from 'react-intl';

const messages = defineMessages('components.AirDateBadge', {
  airedrelative: 'Aired {relativeTime}',
  airsrelative: 'Airing {relativeTime}',
});

type AirDateBadgeProps = {
  airDate: string;
};

const AirDateBadge = ({ airDate }: AirDateBadgeProps) => {
  const WEEK = 1000 * 60 * 60 * 24 * 8;
  const intl = useIntl();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dAirDate = new Date(airDate);
  const nowDate = new Date();
  const alreadyAired = dAirDate.getTime() < nowDate.getTime();

  const compareWeek = new Date(
    alreadyAired ? Date.now() - WEEK : Date.now() + WEEK
  );

  let showRelative = false;

  if (
    (alreadyAired && dAirDate.getTime() > compareWeek.getTime()) ||
    (!alreadyAired && dAirDate.getTime() < compareWeek.getTime())
  ) {
    showRelative = true;
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge badgeType="light">
        {intl.formatDate(dAirDate, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone,
        })}
      </Badge>
      {showRelative && (
        <Badge badgeType="light">
          {intl.formatMessage(
            alreadyAired ? messages.airedrelative : messages.airsrelative,
            {
              relativeTime: (
                <FormattedRelativeTime
                  value={(dAirDate.getTime() - Date.now()) / 1000}
                  numeric="auto"
                  updateIntervalInSeconds={1}
                />
              ),
            }
          )}
        </Badge>
      )}
    </div>
  );
};

export default AirDateBadge;
