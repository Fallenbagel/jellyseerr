import { XCircleIcon } from '@heroicons/react/outline';
import { SearchIcon } from '@heroicons/react/solid';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSearchInput from '../../../hooks/useSearchInput';

const messages = defineMessages({
  searchPlaceholder: 'Search Movies & TV',
});

const SearchInput: React.FC = () => {
  const intl = useIntl();
  const { searchValue, setSearchValue, setIsOpen, clear } = useSearchInput();
  return (
    <div className="flex flex-1">
      <div className="flex w-full">
        <label htmlFor="search_field" className="sr-only">
          Search
        </label>
        <div className="relative flex items-center w-full text-white focus-within:text-gray-200">
          <div className="absolute inset-y-0 flex items-center pointer-events-none left-4">
            <SearchIcon className="w-5 h-5" />
          </div>
          <input
            id="search_field"
            style={{ paddingRight: searchValue.length > 0 ? '1.75rem' : '' }}
            className="block w-full py-2 pl-10 text-white placeholder-gray-300 bg-gray-900 border border-gray-600 rounded-full bg-opacity-80 focus:bg-opacity-100 focus:border-gray-500 hover:border-gray-500 focus:outline-none focus:ring-0 focus:placeholder-gray-400 sm:text-base"
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            type="search"
            inputMode="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              if (searchValue === '') {
                setIsOpen(false);
              }
            }}
          />
          {searchValue.length > 0 && (
            <button
              className="absolute inset-y-0 p-1 m-auto text-gray-400 transition border-none outline-none right-2 h-7 w-7 focus:outline-none focus:border-none hover:text-white"
              onClick={() => clear()}
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
