import React from 'react';

interface PlaceholderProps {
  canExpand?: boolean;
}

const Placeholder: React.FC<PlaceholderProps> = ({ canExpand = false }) => {
  return (
    <div
      className={`relative animate-pulse rounded-xl bg-gray-700 ${
        canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'
      }`}
    >
      <div className="w-full" style={{ paddingBottom: '150%' }} />
    </div>
  );
};

export default Placeholder;
