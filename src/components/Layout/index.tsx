import React, { useEffect, useState } from 'react';
import SearchInput from './SearchInput';
import UserDropdown from './UserDropdown';
import Sidebar from './Sidebar';
import LanguagePicker from './LanguagePicker';
import { useRouter } from 'next/router';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Permission, useUser } from '../../hooks/useUser';

const messages = defineMessages({
  alphawarning:
    'This is ALPHA software. Features may be broken and/or unstable. Please report issues on GitHub!',
});

const Layout: React.FC = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { hasPermission } = useUser();
  const router = useRouter();

  useEffect(() => {
    const updateScrolled = () => {
      if (window.pageYOffset > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrolled);
    };
  }, []);

  return (
    <div className="flex h-full min-w-0 min-h-full bg-gray-900">
      <div className="absolute w-full h-64 from-gray-800 to-gray-900 bg-gradient-to-bl">
        <div className="relative inset-0 w-full h-full from-gray-900 to-transparent bg-gradient-to-t" />
      </div>
      <Sidebar open={isSidebarOpen} setClosed={() => setSidebarOpen(false)} />

      <div className="relative flex flex-col flex-1 w-0 min-w-0 mb-16 md:ml-64">
        <div
          className={`fixed left-0 right-0 z-10 flex flex-shrink-0 h-16 bg-opacity-80 transition duration-300 ${
            isScrolled ? 'bg-gray-700' : 'bg-transparent'
          } md:left-64`}
          style={{
            backdropFilter: isScrolled ? 'blur(5px)' : undefined,
            WebkitBackdropFilter: isScrolled ? 'blur(5px)' : undefined,
          }}
        >
          <button
            className="px-4 text-gray-200 focus:outline-none focus:bg-gray-300 focus:text-gray-600 md:hidden"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="w-6 h-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          <div className="flex justify-between flex-1 pr-4 md:pr-4 md:pl-4">
            <SearchInput />
            <div className="flex items-center ml-2 md:ml-4">
              <LanguagePicker />
              <UserDropdown />
            </div>
          </div>
        </div>

        <main className="relative z-0 top-16 focus:outline-none" tabIndex={0}>
          <div className="mb-6">
            <div className="px-4 mx-auto max-w-8xl">
              {router.pathname === '/' && hasPermission(Permission.ADMIN) && (
                <div className="p-4 mt-6 bg-indigo-700 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 ml-3 md:flex md:justify-between">
                      <p className="text-sm leading-5 text-white">
                        <FormattedMessage {...messages.alphawarning} />
                      </p>
                      <p className="mt-3 text-sm leading-5 md:mt-0 md:ml-6">
                        <a
                          href="http://github.com/sct/overseerr"
                          className="font-medium text-indigo-100 transition duration-150 ease-in-out whitespace-nowrap hover:text-white"
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub &rarr;
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
