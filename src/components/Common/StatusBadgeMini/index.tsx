import {
  BellIcon,
  CheckIcon,
  ClockIcon,
  MinusSmIcon,
} from '@heroicons/react/solid';
import { MediaStatus } from '@server/constants/media';

interface StatusBadgeMiniProps {
  status: MediaStatus;
  is4k?: boolean;
}

const StatusBadgeMini = ({ status, is4k = false }: StatusBadgeMiniProps) => {
  const badgeStyle = ['w-5 rounded-full p-0.5 text-white ring-1'];
  let indicatorIcon: React.ReactNode;

  switch (status) {
    case MediaStatus.PROCESSING:
      badgeStyle.push('bg-indigo-500 ring-indigo-400');
      indicatorIcon = <ClockIcon />;
      break;
    case MediaStatus.AVAILABLE:
      badgeStyle.push('bg-green-500 ring-green-400');
      indicatorIcon = <CheckIcon />;
      break;
    case MediaStatus.PENDING:
      badgeStyle.push('bg-yellow-500 ring-yellow-400');
      indicatorIcon = <BellIcon />;
      break;
    case MediaStatus.PARTIALLY_AVAILABLE:
      badgeStyle.push('bg-green-500 ring-green-400');
      indicatorIcon = <MinusSmIcon />;
      break;
  }

  return (
    <div className="inline-flex whitespace-nowrap rounded-full text-xs font-semibold leading-5 ring-1 ring-gray-700">
      <div className={badgeStyle.join(' ')}>{indicatorIcon}</div>
      {is4k && <span className="pl-1 pr-2 text-gray-200">4K</span>}
    </div>
  );
};

export default StatusBadgeMini;
