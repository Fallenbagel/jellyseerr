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
    <li className="col-span-1 flex shadow-sm rounded-md">
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-700 bg-gray-600 rounded-md truncate">
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
                <svg
                  className="h-3 w-3 text-gray-400"
                  fill="none"
                  viewBox="0 0 12 12"
                >
                  <path
                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                className={`${
                  isEnabled
                    ? 'opacity-100 ease-in duration-200'
                    : 'opacity-0 ease-out duration-100'
                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
              >
                <svg
                  className="h-3 w-3 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                >
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                </svg>
              </span>
            </span>
          </span>
        </div>
      </div>
    </li>
  );
};

export default LibraryItem;
