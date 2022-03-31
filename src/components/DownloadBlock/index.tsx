import React from 'react';
import { FormattedRelativeTime } from 'react-intl';
import { DownloadingItem } from '../../../server/lib/downloadtracker';
import Badge from '../Common/Badge';

interface DownloadBlockProps {
  downloadItem: DownloadingItem;
  is4k?: boolean;
}

const DownloadBlock: React.FC<DownloadBlockProps> = ({
  downloadItem,
  is4k = false,
}) => {
  return (
    <div className="p-4">
      <div className="w-56 mb-2 text-sm truncate sm:w-80 md:w-full">
        {downloadItem.title}
      </div>
      <div className="relative h-6 min-w-0 mb-2 overflow-hidden bg-gray-700 rounded-full">
        <div
          className="h-8 transition-all duration-200 ease-in-out bg-indigo-600"
          style={{
            width: `${
              downloadItem.size
                ? Math.round(
                    ((downloadItem.size - downloadItem.sizeLeft) /
                      downloadItem.size) *
                      100
                  )
                : 0
            }%`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center w-full h-6 text-xs">
          <span>
            {downloadItem.size
              ? Math.round(
                  ((downloadItem.size - downloadItem.sizeLeft) /
                    downloadItem.size) *
                    100
                )
              : 0}
            %
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span>
          {is4k && (
            <Badge badgeType="warning" className="mr-1">
              4K
            </Badge>
          )}
          <Badge className="capitalize">{downloadItem.status}</Badge>
        </span>
        <span>
          ETA{' '}
          {downloadItem.estimatedCompletionTime ? (
            <FormattedRelativeTime
              value={Math.floor(
                (new Date(downloadItem.estimatedCompletionTime).getTime() -
                  Date.now()) /
                  1000
              )}
              updateIntervalInSeconds={1}
            />
          ) : (
            'N/A'
          )}
        </span>
      </div>
    </div>
  );
};

export default DownloadBlock;
