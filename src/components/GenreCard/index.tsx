import Link from 'next/link';
import React, { useState } from 'react';
import { withProperties } from '../../utils/typeHelpers';
import CachedImage from '../Common/CachedImage';

interface GenreCardProps {
  name: string;
  image: string;
  url: string;
  canExpand?: boolean;
}

const GenreCard: React.FC<GenreCardProps> = ({
  image,
  url,
  name,
  canExpand = false,
}) => {
  const [isHovered, setHovered] = useState(false);

  return (
    <Link href={url}>
      <a
        className={`relative flex items-center justify-center h-32 sm:h-36 ${
          canExpand ? 'w-full' : 'w-56 sm:w-72'
        } p-8 shadow transition ease-in-out duration-300 cursor-pointer transform-gpu ring-1 ${
          isHovered
            ? 'bg-gray-700 scale-105 ring-gray-500 bg-opacity-100'
            : 'bg-gray-800 scale-100 ring-gray-700 bg-opacity-80'
        } rounded-xl bg-cover bg-center overflow-hidden`}
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
        <CachedImage src={image} alt="" layout="fill" objectFit="cover" />
        <div
          className={`absolute z-10 inset-0 w-full h-full transition duration-300 bg-gray-800 ${
            isHovered ? 'bg-opacity-10' : 'bg-opacity-30'
          }`}
        />
        <div className="relative z-20 w-full text-2xl font-bold text-center text-white truncate whitespace-normal sm:text-3xl">
          {name}
        </div>
      </a>
    </Link>
  );
};

const GenreCardPlaceholder: React.FC = () => {
  return (
    <div
      className={`relative h-32 w-56 sm:h-40 sm:w-72 animate-pulse rounded-xl bg-gray-700`}
    ></div>
  );
};

export default withProperties(GenreCard, { Placeholder: GenreCardPlaceholder });
