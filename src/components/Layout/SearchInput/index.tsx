import React from 'react';
import useSearchInput from '../../../hooks/useSearchInput';
import { defineMessages, useIntl } from 'react-intl';
import ClearButton from '../../../assets/xcircle.svg';

const messages = defineMessages({
  searchPlaceholder: 'Search Movies & TV',
});

const SearchInput: React.FC = () => {
  const intl = useIntl();
  const { searchValue, setSearchValue, setIsOpen, clear } = useSearchInput();
  return (
    <div className="flex flex-1">
      <div className="flex w-full md:ml-0">
        <label htmlFor="search_field" className="sr-only">
          Search
        </label>
        <div className="relative flex items-center w-full text-white focus-within:text-gray-200">
          <div className="absolute inset-y-0 flex items-center pointer-events-none left-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              />
            </svg>
          </div>
          <input
            id="search_field"
            style={{ paddingRight: searchValue.length > 0 ? '1.75rem' : '' }}
            className="block w-full py-2 pl-10 text-white placeholder-gray-300 bg-gray-900 border border-gray-600 rounded-full focus:border-gray-500 focus:outline-none focus:ring-0 focus:placeholder-gray-400 sm:text-base"
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            type="search"
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
              <ClearButton />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
