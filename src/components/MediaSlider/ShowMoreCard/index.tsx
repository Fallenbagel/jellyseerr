import Link from 'next/link';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  seemore: 'See More',
});

interface ShowMoreCardProps {
  url: string;
  posters: (string | undefined)[];
}

const ShowMoreCard: React.FC<ShowMoreCardProps> = ({ url, posters }) => {
  const intl = useIntl();
  const [isHovered, setHovered] = useState(false);
  return (
    <Link href={url}>
      <a
        className={'w-36 sm:w-36 md:w-44'}
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
        <div
          className={`relative w-36 sm:w-36 md:w-44
         rounded-lg text-white shadow-lg overflow-hidden transition ease-in-out duration-150 cursor-pointer transform-gpu ${
           isHovered ? 'bg-gray-500 scale-105' : 'bg-gray-600 scale-100'
         }`}
        >
          <div style={{ paddingBottom: '150%' }}>
            <div className="absolute inset-0 flex flex-col items-center w-full h-full p-2">
              <div className="relative z-10 flex flex-wrap items-center justify-center h-full opacity-30">
                {posters[0] && (
                  <div className="w-1/2 p-1">
                    <img
                      src={`//image.tmdb.org/t/p/w300_and_h450_face${posters[0]}`}
                      alt=""
                      className="w-full rounded-md"
                    />
                  </div>
                )}
                {posters[1] && (
                  <div className="w-1/2 p-1">
                    <img
                      src={`//image.tmdb.org/t/p/w300_and_h450_face${posters[1]}`}
                      alt=""
                      className="w-full rounded-md"
                    />
                  </div>
                )}
                {posters[2] && (
                  <div className="w-1/2 p-1">
                    <img
                      src={`//image.tmdb.org/t/p/w300_and_h450_face${posters[2]}`}
                      alt=""
                      className="w-full rounded-md"
                    />
                  </div>
                )}
                {posters[3] && (
                  <div className="w-1/2 p-1">
                    <img
                      src={`//image.tmdb.org/t/p/w300_and_h450_face${posters[3]}`}
                      alt=""
                      className="w-full rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                <svg
                  className="w-14"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="mt-2 font-extrabold">
                  {intl.formatMessage(messages.seemore)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ShowMoreCard;
