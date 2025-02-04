import Badge from '@app/components/Common/Badge';
import Tooltip from '@app/components/Common/Tooltip';
import defineMessages from '@app/utils/defineMessages';
import { TagIcon } from '@heroicons/react/20/solid';
import type { BlacklistItem } from '@server/interfaces/api/blacklistInterfaces';
import type { Keyword } from '@server/models/common';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Settings', {
  blacklistedTagsText: 'Blacklisted Tags',
});

interface BlacklistedTagsBadgeProps {
  data: BlacklistItem;
}

const BlacklistedTagsBadge = ({ data }: BlacklistedTagsBadgeProps) => {
  const [tagNamesBlacklistedFor, setTagNamesBlacklistedFor] =
    useState<string>('Loading...');
  const intl = useIntl();

  useEffect(() => {
    if (data.blacklistedTags == null) {
      return;
    }

    const keywordIds = data.blacklistedTags.slice(1, -1).split(',');
    Promise.all(
      keywordIds.map(async (keywordId) => {
        const res = await fetch(`/api/v1/keyword/${keywordId}`);
        if (!res.ok) {
          return '';
        }
        const keyword: Keyword = await res.json();

        return keyword.name;
      })
    ).then((keywords) => {
      setTagNamesBlacklistedFor(keywords.join(', '));
    });
  }, [data.blacklistedTags]);

  return (
    <Tooltip
      content={tagNamesBlacklistedFor}
      tooltipConfig={{ followCursor: false }}
    >
      <Badge
        badgeType="dark"
        className="items-center border border-red-500 !text-red-400"
      >
        <TagIcon className="mr-1 h-4" />
        {intl.formatMessage(messages.blacklistedTagsText)}
      </Badge>
    </Tooltip>
  );
};

export default BlacklistedTagsBadge;
