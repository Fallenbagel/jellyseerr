import { withProperties } from '@app/utils/typeHelpers';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import {
  Fragment,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';

interface DropdownItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  buttonType?: 'primary' | 'ghost';
}

const DropdownItem = ({
  children,
  buttonType = 'primary',
  ...props
}: DropdownItemProps) => {
  let styleClass = 'button-md text-white';

  switch (buttonType) {
    case 'ghost':
      styleClass +=
        ' bg-transparent rounded hover:bg-gradient-to-br from-indigo-600 to-purple-600 text-white focus:border-gray-500 focus:text-white';
      break;
    default:
      styleClass +=
        ' bg-indigo-600 rounded hover:bg-indigo-500 focus:border-indigo-700 focus:text-white';
  }
  return (
    <Menu.Item>
      <a
        className={`flex cursor-pointer items-center px-4 py-2 text-sm leading-5 focus:outline-none ${styleClass}`}
        {...props}
      >
        {children}
      </a>
    </Menu.Item>
  );
};

type DropdownItemsProps = HTMLAttributes<HTMLDivElement> & {
  dropdownType: 'primary' | 'ghost';
};

const DropdownItems = ({
  children,
  className,
  dropdownType,
  ...props
}: DropdownItemsProps) => {
  let dropdownClasses: string;

  switch (dropdownType) {
    case 'ghost':
      dropdownClasses =
        'bg-gray-800 border border-gray-700 bg-opacity-80 p-1 backdrop-blur';
      break;
    default:
      dropdownClasses = 'bg-indigo-600 p-1';
  }

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Menu.Items
        className={`absolute right-0 z-40 mt-2 -mr-1 w-56 origin-top-right rounded-md p-1 shadow-lg ${dropdownClasses} ${className}`}
        {...props}
      >
        <div className="py-1">{children}</div>
      </Menu.Items>
    </Transition>
  );
};

interface DropdownProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: React.ReactNode;
  dropdownIcon?: React.ReactNode;
  buttonType?: 'primary' | 'ghost';
}

const Dropdown = ({
  text,
  children,
  dropdownIcon,
  className,
  buttonType = 'primary',
  ...props
}: DropdownProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  let dropdownButtonClasses = 'button-md text-white border';

  switch (buttonType) {
    case 'ghost':
      dropdownButtonClasses +=
        ' bg-transparent border-gray-600 hover:border-gray-200 focus:border-gray-100 active:border-gray-100';
      break;
    default:
      dropdownButtonClasses +=
        ' bg-indigo-600 border-indigo-500 bg-opacity-80 hover:bg-opacity-100 hover:border-indigo-500 active:bg-indigo-700 active:border-indigo-700 focus:ring-blue';
  }

  return (
    <Menu as="div" className="relative z-10">
      <Menu.Button
        type="button"
        className={` inline-flex h-full items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out hover:z-20 focus:z-20 focus:outline-none ${dropdownButtonClasses} ${className}`}
        ref={buttonRef}
        disabled={!children}
        {...props}
      >
        <span>{text}</span>
        {children && (dropdownIcon ? dropdownIcon : <ChevronDownIcon />)}
      </Menu.Button>
      {children && (
        <DropdownItems dropdownType={buttonType}>{children}</DropdownItems>
      )}
    </Menu>
  );
};
export default withProperties(Dropdown, {
  Item: DropdownItem,
  Items: DropdownItems,
});
