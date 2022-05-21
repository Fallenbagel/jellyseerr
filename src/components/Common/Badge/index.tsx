import Link from 'next/link';
import React from 'react';

interface BadgeProps {
  badgeType?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  className?: string;
  href?: string;
}

const Badge: React.FC<BadgeProps> = ({
  badgeType = 'default',
  className,
  href,
  children,
}) => {
  const badgeStyle = [
    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap',
  ];

  if (href) {
    badgeStyle.push('transition cursor-pointer !no-underline');
  } else {
    badgeStyle.push('cursor-default');
  }

  switch (badgeType) {
    case 'danger':
      badgeStyle.push('bg-red-600 !text-red-100');
      if (href) {
        badgeStyle.push('hover:bg-red-500');
      }
      break;
    case 'warning':
      badgeStyle.push('bg-yellow-500 !text-yellow-100');
      if (href) {
        badgeStyle.push('hover:bg-yellow-400');
      }
      break;
    case 'success':
      badgeStyle.push('bg-green-500 !text-green-100');
      if (href) {
        badgeStyle.push('hover:bg-green-400');
      }
      break;
    default:
      badgeStyle.push('bg-indigo-500 !text-indigo-100');
      if (href) {
        badgeStyle.push('hover:bg-indigo-400');
      }
  }

  if (className) {
    badgeStyle.push(className);
  }

  if (href?.includes('://')) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={badgeStyle.join(' ')}
      >
        {children}
      </a>
    );
  } else if (href) {
    return (
      <Link href={href}>
        <a className={badgeStyle.join(' ')}>{children}</a>
      </Link>
    );
  } else {
    return <span className={badgeStyle.join(' ')}>{children}</span>;
  }
};

export default Badge;
