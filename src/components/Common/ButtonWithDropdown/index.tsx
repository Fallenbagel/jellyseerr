import React, {
  useState,
  useRef,
  AnchorHTMLAttributes,
  ReactNode,
  ButtonHTMLAttributes,
} from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import Transition from '../../Transition';
import { withProperties } from '../../../utils/typeHelpers';

interface DropdownItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  buttonType?: 'primary' | 'ghost';
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  buttonType = 'primary',
  ...props
}) => {
  let styleClass = '';

  switch (buttonType) {
    case 'ghost':
      styleClass =
        'text-white bg-gray-700 hover:bg-gray-600 hover:text-white focus:border-gray-500 focus:text-white';
      break;
    default:
      styleClass =
        'text-white bg-indigo-600 hover:bg-indigo-500 hover:text-white focus:border-indigo-700 focus:text-white';
  }
  return (
    <a
      className={`flex items-center px-4 py-2 text-sm leading-5 cursor-pointer focus:outline-none ${styleClass}`}
      {...props}
    >
      {children}
    </a>
  );
};

interface ButtonWithDropdownProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: ReactNode;
  dropdownIcon?: ReactNode;
  buttonType?: 'primary' | 'ghost';
}

const ButtonWithDropdown: React.FC<ButtonWithDropdownProps> = ({
  text,
  children,
  dropdownIcon,
  className,
  buttonType = 'primary',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useClickOutside(buttonRef, () => setIsOpen(false));

  const styleClasses = {
    mainButtonClasses: '',
    dropdownSideButtonClasses: '',
    dropdownClasses: '',
  };

  switch (buttonType) {
    case 'ghost':
      styleClasses.mainButtonClasses =
        'text-white bg-transparent border border-gray-600 hover:border-gray-200 focus:border-gray-100 active:border-gray-100';
      styleClasses.dropdownSideButtonClasses =
        'bg-transparent border border-gray-600 hover:border-gray-200 focus:border-gray-100 active:border-gray-100';
      styleClasses.dropdownClasses = 'bg-gray-700';
      break;
    default:
      styleClasses.mainButtonClasses =
        'text-white bg-indigo-600 hover:text-white hover:bg-indigo-500 active:bg-indigo-700 focus:ring-blue';
      styleClasses.dropdownSideButtonClasses =
        'bg-indigo-700 border border-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:ring-blue';
      styleClasses.dropdownClasses = 'bg-indigo-600';
  }

  return (
    <span className="relative z-0 inline-flex h-full rounded-md shadow-sm">
      <button
        type="button"
        className={`relative inline-flex h-full items-center px-4 py-2 text-sm leading-5 font-medium z-10 hover:z-20 focus:z-20 focus:outline-none transition ease-in-out duration-150 ${
          styleClasses.mainButtonClasses
        } ${children ? 'rounded-l-md' : 'rounded-md'} ${className}`}
        ref={buttonRef}
        {...props}
      >
        {text}
      </button>
      {children && (
        <span className="relative z-10 block -ml-px">
          <button
            type="button"
            className={`relative inline-flex items-center h-full px-2 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out rounded-r-md focus:z-10 ${styleClasses.dropdownSideButtonClasses}`}
            aria-label="Expand"
            onClick={() => setIsOpen((state) => !state)}
          >
            {dropdownIcon ? (
              dropdownIcon
            ) : (
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <Transition
            show={isOpen}
            enter="transition ease-out duration-100 opacity-0"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75 opacity-100"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <div className="absolute right-0 w-56 mt-2 -mr-1 origin-top-right rounded-md shadow-lg">
              <div
                className={`rounded-md ring-1 ring-black ring-opacity-5 ${styleClasses.dropdownClasses}`}
              >
                <div className="py-1">{children}</div>
              </div>
            </div>
          </Transition>
        </span>
      )}
    </span>
  );
};
export default withProperties(ButtonWithDropdown, { Item: DropdownItem });
