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
      <div className={`min-w-0 flex-1 mx-${extraMargin}`}>
        <h2 className="mb-4 truncate text-2xl font-bold leading-7 text-gray-100 sm:overflow-visible sm:text-4xl sm:leading-9 md:mb-0">
          <span className="bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {children}
          </span>
        </h2>
        {subtext && <div className="mt-2 text-gray-400">{subtext}</div>}
      </div>
    </div>
  );
};

export default Header;
