import React from 'react';

interface HeaderProps {
  extraMargin?: number;
  subtext?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  children,
  extraMargin = 0,
  subtext,
}) => {
  return (
    <div className="mt-8 md:flex md:items-center md:justify-between">
      <div className={`flex-1 min-w-0 mx-${extraMargin}`}>
        <h2 className="mb-4 text-2xl font-bold leading-7 text-gray-100 truncate sm:text-4xl sm:leading-9 sm:overflow-visible md:mb-0">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400">
            {children}
          </span>
        </h2>
        {subtext && <div className="mt-2 text-gray-400">{subtext}</div>}
      </div>
    </div>
  );
};

export default Header;
