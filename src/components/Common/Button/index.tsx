import React, { ForwardedRef } from 'react';

export type ButtonType =
  | 'default'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'ghost';

// Helper type to override types (overrides onClick)
type MergeElementProps<
  T extends React.ElementType,
  P extends Record<string, unknown>
> = Omit<React.ComponentProps<T>, keyof P> & P;

type ElementTypes = 'button' | 'a';

type Element<P extends ElementTypes = 'button'> = P extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

type BaseProps<P> = {
  buttonType?: ButtonType;
  buttonSize?: 'default' | 'lg' | 'md' | 'sm';
  // Had to do declare this manually as typescript would assume e was of type any otherwise
  onClick?: (
    e: React.MouseEvent<P extends 'a' ? HTMLAnchorElement : HTMLButtonElement>
  ) => void;
};

type ButtonProps<P extends React.ElementType> = {
  as?: P;
} & MergeElementProps<P, BaseProps<P>>;

function Button<P extends ElementTypes = 'button'>(
  {
    buttonType = 'default',
    buttonSize = 'default',
    as,
    children,
    className,
    ...props
  }: ButtonProps<P>,
  ref?: React.Ref<Element<P>>
): JSX.Element {
  const buttonStyle = [
    'inline-flex items-center justify-center border border-transparent leading-5 font-medium rounded-md focus:outline-none transition ease-in-out duration-150 cursor-pointer disabled:opacity-50 whitespace-nowrap',
  ];
  switch (buttonType) {
    case 'primary':
      buttonStyle.push(
        'text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 focus:border-indigo-700 focus:ring-indigo active:bg-indigo-700 active:border-indigo-700'
      );
      break;
    case 'danger':
      buttonStyle.push(
        'text-white bg-red-600 border-red-600 hover:bg-red-500 hover:border-red-500 focus:border-red-700 focus:ring-red active:bg-red-700 active:border-red-700'
      );
      break;
    case 'warning':
      buttonStyle.push(
        'text-white bg-yellow-500 border-yellow-500 hover:bg-yellow-400 hover:border-yellow-400 focus:border-yellow-700 focus:ring-yellow active:bg-yellow-700 active:border-yellow-700'
      );
      break;
    case 'success':
      buttonStyle.push(
        'text-white bg-green-500 border-green-500 hover:bg-green-400 hover:border-green-400 focus:border-green-700 focus:ring-green active:bg-green-700 active:border-green-700'
      );
      break;
    case 'ghost':
      buttonStyle.push(
        'text-white bg-transaprent border-gray-600 hover:border-gray-200 focus:border-gray-100 active:border-gray-100'
      );
      break;
    default:
      buttonStyle.push(
        'text-gray-200 bg-gray-600 border-gray-600 hover:text-white hover:bg-gray-500 hover:border-gray-500 group-hover:text-white group-hover:bg-gray-500 group-hover:border-gray-500 focus:border-blue-300 focus:ring-blue active:text-gray-200 active:bg-gray-500 active:border-gray-500'
      );
  }

  switch (buttonSize) {
    case 'sm':
      buttonStyle.push('px-2.5 py-1.5 text-xs button-sm');
      break;
    case 'lg':
      buttonStyle.push('px-6 py-3 text-base button-lg');
      break;
    case 'md':
    default:
      buttonStyle.push('px-4 py-2 text-sm button-md');
  }

  buttonStyle.push(className ?? '');

  if (as === 'a') {
    return (
      <a
        className={buttonStyle.join(' ')}
        {...(props as React.ComponentProps<'a'>)}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
      >
        <span className="flex items-center">{children}</span>
      </a>
    );
  } else {
    return (
      <button
        className={buttonStyle.join(' ')}
        {...(props as React.ComponentProps<'button'>)}
        ref={ref as ForwardedRef<HTMLButtonElement>}
      >
        <span className="flex items-center">{children}</span>
      </button>
    );
  }
}

export default React.forwardRef(Button) as typeof Button;
