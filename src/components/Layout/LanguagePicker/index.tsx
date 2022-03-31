import React, { useState, useRef, useContext } from 'react';
import Transition from '../../Transition';
import useClickOutside from '../../../hooks/useClickOutside';
import {
  LanguageContext,
  AvailableLocales,
} from '../../../context/LanguageContext';
import { FormattedMessage, defineMessages } from 'react-intl';

const messages = defineMessages({
  changelanguage: 'Change Language',
});

type AvailableLanguageObject = Record<
  string,
  { code: AvailableLocales; display: string }
>;

const availableLanguages: AvailableLanguageObject = {
  de: {
    code: 'de',
    display: 'Deutsch',
  },
  en: {
    code: 'en',
    display: 'English',
  },
  es: {
    code: 'es',
    display: 'Español',
  },
  fr: {
    code: 'fr',
    display: 'Français',
  },
  it: {
    code: 'it',
    display: 'Italiano',
  },
  hu: {
    code: 'hu',
    display: 'Magyar',
  },
  nl: {
    code: 'nl',
    display: 'Nederlands',
  },
  'nb-NO': {
    code: 'nb-NO',
    display: 'Norsk Bokmål',
  },
  'pt-BR': {
    code: 'pt-BR',
    display: 'Português (Brasil)',
  },
  'pt-PT': {
    code: 'pt-PT',
    display: 'Português (Portugal)',
  },
  sv: {
    code: 'sv',
    display: 'Svenska',
  },
  ru: {
    code: 'ru',
    display: 'pусский',
  },
  sr: {
    code: 'sr',
    display: 'српски језик‬',
  },
  ja: {
    code: 'ja',
    display: '日本語',
  },
  'zh-TW': {
    code: 'zh-TW',
    display: '中文（臺灣）',
  },
};

const LanguagePicker: React.FC = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale } = useContext(LanguageContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  return (
    <div className="relative">
      <div>
        <button
          className="p-1 text-gray-400 rounded-full hover:bg-gray-600 hover:text-white focus:outline-none focus:ring focus:text-white"
          aria-label="Language Picker"
          onClick={() => setDropdownOpen(true)}
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <Transition
        show={isDropdownOpen}
        enter="transition ease-out duration-100 opacity-0"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75 opacity-100"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className="absolute right-0 w-56 mt-2 origin-top-right rounded-md shadow-lg"
          ref={dropdownRef}
        >
          <div className="px-3 py-2 bg-gray-700 rounded-md ring-1 ring-black ring-opacity-5">
            <div>
              <label
                htmlFor="language"
                className="block pb-2 text-sm font-medium leading-5 text-gray-300"
              >
                <FormattedMessage {...messages.changelanguage} />
              </label>
              <select
                id="language"
                className="rounded-md"
                onChange={(e) =>
                  setLocale && setLocale(e.target.value as AvailableLocales)
                }
                onBlur={(e) =>
                  setLocale && setLocale(e.target.value as AvailableLocales)
                }
                defaultValue={locale}
              >
                {(Object.keys(
                  availableLanguages
                ) as (keyof typeof availableLanguages)[]).map((key) => (
                  <option key={key} value={availableLanguages[key].code}>
                    {availableLanguages[key].display}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default LanguagePicker;
