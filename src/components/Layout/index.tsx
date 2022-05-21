import { MenuAlt2Icon } from '@heroicons/react/outline';
import { ArrowLeftIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { AvailableLocale } from '../../context/LanguageContext';
import useLocale from '../../hooks/useLocale';
import useSettings from '../../hooks/useSettings';
import { useUser } from '../../hooks/useUser';
import SearchInput from './SearchInput';
import Sidebar from './Sidebar';
import UserDropdown from './UserDropdown';

const Layout: React.FC = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { currentSettings } = useSettings();
  const { setLocale } = useLocale();

  useEffect(() => {
    if (setLocale && user) {
      setLocale(
        (user?.settings?.locale
          ? user.settings.locale
          : currentSettings.locale) as AvailableLocale
      );
    }
  }, [setLocale, currentSettings.locale, user]);

  useEffect(() => {
    const updateScrolled = () => {
      if (window.pageYOffset > 20) {
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
    <div className="flex h-full min-h-full min-w-0 bg-gray-900">
      <div className="pwa-only fixed inset-0 z-20 h-1 w-full border-gray-700 md:border-t" />
      <div className="absolute top-0 h-64 w-full bg-gradient-to-bl from-gray-800 to-gray-900">
        <div className="relative inset-0 h-full w-full bg-gradient-to-t from-gray-900 to-transparent" />
      </div>
      <Sidebar open={isSidebarOpen} setClosed={() => setSidebarOpen(false)} />

      <div className="relative mb-16 flex w-0 min-w-0 flex-1 flex-col lg:ml-64">
        <div
          className={`searchbar fixed left-0 right-0 top-0 z-10 flex flex-shrink-0 bg-opacity-80 transition duration-300 ${
            isScrolled ? 'bg-gray-700' : 'bg-transparent'
          } lg:left-64`}
          style={{
            backdropFilter: isScrolled ? 'blur(5px)' : undefined,
            WebkitBackdropFilter: isScrolled ? 'blur(5px)' : undefined,
          }}
        >
          <button
            className={`px-4 text-white ${
              isScrolled ? 'opacity-90' : 'opacity-70'
            } transition duration-300 focus:outline-none lg:hidden`}
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuAlt2Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-between pr-4 md:pr-4 md:pl-4">
            <button
              className={`mr-2 text-white ${
                isScrolled ? 'opacity-90' : 'opacity-70'
              } pwa-only transition duration-300 hover:text-white focus:text-white focus:outline-none`}
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="w-7" />
            </button>
            <SearchInput />
            <div className="flex items-center">
              <UserDropdown />
            </div>
          </div>
        </div>

        <main className="relative top-16 z-0 focus:outline-none" tabIndex={0}>
          <div className="mb-6">
            <div className="max-w-8xl mx-auto px-4">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
