import { CheckIcon, XIcon } from '@heroicons/react/solid';
import React from 'react';

interface LibraryItemProps {
  isEnabled?: boolean;
  name: string;
  onToggle: () => void;
}

const LibraryItem: React.FC<LibraryItemProps> = ({
  isEnabled,
  name,
  onToggle,
}) => {
  return (
    <li className="flex col-span-1 rounded-md shadow-sm">
      <div className="flex items-center justify-between flex-1 truncate bg-gray-600 border-t border-b border-r border-gray-700 rounded-md">
        <div className="flex-1 px-4 py-6 text-sm leading-5 truncate cursor-default">
          {name}
        </div>
        <div className="flex-shrink-0 pr-2">
          <span
            role="checkbox"
            tabIndex={0}
            aria-checked={isEnabled}
            onClick={() => onToggle()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onToggle();
              }
            }}
            className={`${
              isEnabled ? 'bg-indigo-600' : 'bg-gray-700'
            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring`}
          >
            <span
              aria-hidden="true"
              className={`${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              } relative inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200`}
            >
              <span
                className={`${
                  isEnabled
                    ? 'opacity-0 ease-out duration-100'
                    : 'opacity-100 ease-in duration-200'
                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
              >
                <XIcon className="w-3 h-3 text-gray-400" />
              </span>
              <span
                className={`${
                  isEnabled
                    ? 'opacity-100 ease-in duration-200'
                    : 'opacity-0 ease-out duration-100'
                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
              >
                <CheckIcon className="w-3 h-3 text-indigo-600" />
              </span>
            </span>
          </span>
        </div>
      </div>
    </li>
  );
};

export default LibraryItem;
