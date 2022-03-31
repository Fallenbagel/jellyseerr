import React from 'react';

interface BadgeProps {
  badgeType?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  badgeType = 'default',
  className,
  children,
}) => {
  const badgeStyle = [
    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-default',
  ];

  switch (badgeType) {
    case 'danger':
      badgeStyle.push('bg-red-600 text-red-100');
      break;
    case 'warning':
      badgeStyle.push('bg-yellow-500 text-yellow-100');
      break;
    case 'success':
      badgeStyle.push('bg-green-500 text-green-100');
      break;
    default:
      badgeStyle.push('bg-indigo-500 text-indigo-100');
  }

  if (className) {
    badgeStyle.push(className);
  }

  return <span className={badgeStyle.join(' ')}>{children}</span>;
};

export default Badge;
