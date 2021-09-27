import Link from 'next/link';
import React, { useState } from 'react';

interface CompanyCardProps {
  name: string;
  image: string;
  url: string;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ image, url, name }) => {
  const [isHovered, setHovered] = useState(false);

  return (
    <Link href={url}>
      <a
        className={`relative flex items-center justify-center h-32 w-56 sm:h-36 sm:w-72 p-8 shadow transition ease-in-out duration-300 cursor-pointer transform-gpu ring-1 ${
          isHovered
            ? 'bg-gray-700 scale-105 ring-gray-500'
            : 'bg-gray-800 scale-100 ring-gray-700'
        } rounded-xl`}
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setHovered(true);
          }
        }}
        role="link"
        tabIndex={0}
      >
        <img
          src={image}
          alt={name}
          className="relative z-40 max-w-full max-h-full"
        />
        <div
          className={`absolute bottom-0 left-0 right-0 h-12 rounded-b-xl bg-gradient-to-t z-0 ${
            isHovered ? 'from-gray-800' : 'from-gray-900'
          }`}
        />
      </a>
    </Link>
  );
};

export default CompanyCard;
