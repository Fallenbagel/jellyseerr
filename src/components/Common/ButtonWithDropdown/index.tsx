import { ChevronDownIcon } from '@heroicons/react/solid';
import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
  useRef,
  useState,
} from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import { withProperties } from '../../../utils/typeHelpers';
import Transition from '../../Transition';

interface DropdownItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  buttonType?: 'primary' | 'ghost';
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  buttonType = 'primary',
  ...props
}) => {
  let styleClass = 'button-md text-white';

  switch (buttonType) {
    case 'ghost':
      styleClass +=
        ' bg-gray-700 hover:bg-gray-600 focus:border-gray-500 focus:text-white';
      break;
    default:
      styleClass +=
        ' bg-indigo-600 hover:bg-indigo-500 focus:border-indigo-700 focus:text-white';
  }
  return (
    <a
      className={`flex cursor-pointer items-center px-4 py-2 text-sm leading-5 focus:outline-none ${styleClass}`}
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
    mainButtonClasses: 'button-md text-white border',
    dropdownSideButtonClasses: 'button-md border',
    dropdownClasses: 'button-md',
  };

  switch (buttonType) {
    case 'ghost':
      styleClasses.mainButtonClasses +=
        ' bg-transparent border-gray-600 hover:border-gray-200 focus:border-gray-100 active:border-gray-100';
      styleClasses.dropdownSideButtonClasses = styleClasses.mainButtonClasses;
      styleClasses.dropdownClasses += ' bg-gray-700';
      break;
    default:
      styleClasses.mainButtonClasses +=
        ' bg-indigo-600 border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 active:bg-indigo-700 active:border-indigo-700 focus:ring-blue';
      styleClasses.dropdownSideButtonClasses +=
        ' bg-indigo-700 border-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:ring-blue';
      styleClasses.dropdownClasses += ' bg-indigo-600';
  }

  return (
    <span className="relative inline-flex h-full rounded-md shadow-sm">
      <button
        type="button"
        className={`relative z-10 inline-flex h-full items-center px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out hover:z-20 focus:z-20 focus:outline-none ${
          styleClasses.mainButtonClasses
        } ${children ? 'rounded-l-md' : 'rounded-md'} ${className}`}
        ref={buttonRef}
        {...props}
      >
        {text}
      </button>
      {children && (
        <span className="relative -ml-px block">
          <button
            type="button"
            className={`relative z-10 inline-flex h-full items-center rounded-r-md px-2 py-2 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:z-20 focus:z-20 ${styleClasses.dropdownSideButtonClasses}`}
            aria-label="Expand"
            onClick={() => setIsOpen((state) => !state)}
          >
            {dropdownIcon ? dropdownIcon : <ChevronDownIcon />}
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
            <div className="absolute right-0 z-40 mt-2 -mr-1 w-56 origin-top-right rounded-md shadow-lg">
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
