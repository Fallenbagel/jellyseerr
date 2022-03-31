import React, { MouseEvent, ReactNode, useRef } from 'react';
import ReactDOM from 'react-dom';
import Button, { ButtonType } from '../Button';
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll';
import LoadingSpinner from '../LoadingSpinner';
import useClickOutside from '../../../hooks/useClickOutside';
import { useIntl } from 'react-intl';
import globalMessages from '../../../i18n/globalMessages';
import Transition from '../../Transition';

interface ModalProps {
  title?: string;
  onCancel?: (e?: MouseEvent<HTMLElement>) => void;
  onOk?: (e?: MouseEvent<HTMLButtonElement>) => void;
  onSecondary?: (e?: MouseEvent<HTMLButtonElement>) => void;
  onTertiary?: (e?: MouseEvent<HTMLButtonElement>) => void;
  cancelText?: string;
  okText?: string;
  secondaryText?: string;
  tertiaryText?: string;
  okDisabled?: boolean;
  cancelButtonType?: ButtonType;
  okButtonType?: ButtonType;
  secondaryButtonType?: ButtonType;
  secondaryDisabled?: boolean;
  tertiaryDisabled?: boolean;
  tertiaryButtonType?: ButtonType;
  disableScrollLock?: boolean;
  backgroundClickable?: boolean;
  iconSvg?: ReactNode;
  loading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  onCancel,
  onOk,
  cancelText,
  okText,
  okDisabled = false,
  cancelButtonType = 'default',
  okButtonType = 'primary',
  children,
  disableScrollLock,
  backgroundClickable = true,
  iconSvg,
  loading = false,
  secondaryButtonType = 'default',
  secondaryDisabled = false,
  onSecondary,
  secondaryText,
  tertiaryButtonType = 'default',
  tertiaryDisabled = false,
  tertiaryText,
  onTertiary,
}) => {
  const intl = useIntl();
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    typeof onCancel === 'function' && backgroundClickable
      ? onCancel()
      : undefined;
  });
  useLockBodyScroll(true, disableScrollLock);

  return ReactDOM.createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-50"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          typeof onCancel === 'function' && backgroundClickable
            ? onCancel()
            : undefined;
        }
      }}
    >
      <Transition
        enter="transition opacity-0 duration-300 transform scale-75"
        enterFrom="opacity-0 scale-75"
        enterTo="opacity-100 scale-100"
        leave="transition opacity-100 duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={loading}
      >
        <div style={{ position: 'absolute' }}>
          <LoadingSpinner />
        </div>
      </Transition>
      <Transition
        enter="transition opacity-0 duration-300 transform scale-75"
        enterFrom="opacity-0 scale-75"
        enterTo="opacity-100 scale-100"
        leave="transition opacity-100 duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={!loading}
      >
        <div
          className="inline-block w-full max-h-full px-4 pt-5 pb-4 overflow-auto text-left align-bottom transition-all transform bg-gray-700 shadow-xl sm:rounded-lg sm:my-8 sm:align-middle sm:max-w-3xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          ref={modalRef}
        >
          <div className="sm:flex sm:items-center">
            {iconSvg && (
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto text-white bg-gray-600 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                {iconSvg}
              </div>
            )}
            <div
              className={`mt-3 text-center sm:mt-0 sm:text-left ${
                iconSvg ? 'sm:ml-4' : 'sm:mb-4'
              }`}
            >
              {title && (
                <span
                  className="text-lg font-medium leading-6 text-white"
                  id="modal-headline"
                >
                  {title}
                </span>
              )}
            </div>
          </div>
          {children && (
            <div className="mt-4 text-sm leading-5 text-gray-300">
              {children}
            </div>
          )}
          {(onCancel || onOk || onSecondary || onTertiary) && (
            <div className="flex flex-row-reverse justify-center mt-5 sm:mt-4 sm:justify-start">
              {typeof onOk === 'function' && (
                <Button
                  buttonType={okButtonType}
                  onClick={onOk}
                  className="ml-3"
                  disabled={okDisabled}
                >
                  {okText ? okText : 'Ok'}
                </Button>
              )}
              {typeof onSecondary === 'function' && secondaryText && (
                <Button
                  buttonType={secondaryButtonType}
                  onClick={onSecondary}
                  className="ml-3"
                  disabled={secondaryDisabled}
                >
                  {secondaryText}
                </Button>
              )}
              {typeof onTertiary === 'function' && tertiaryText && (
                <Button
                  buttonType={tertiaryButtonType}
                  onClick={onTertiary}
                  className="ml-3"
                  disabled={tertiaryDisabled}
                >
                  {tertiaryText}
                </Button>
              )}
              {typeof onCancel === 'function' && (
                <Button
                  buttonType={cancelButtonType}
                  onClick={onCancel}
                  className="ml-3 sm:ml-0"
                >
                  {cancelText
                    ? cancelText
                    : intl.formatMessage(globalMessages.cancel)}
                </Button>
              )}
            </div>
          )}
        </div>
      </Transition>
    </div>,
    document.body
  );
};

export default Modal;
