import React, { MouseEvent, ReactNode, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useIntl } from 'react-intl';
import useClickOutside from '../../../hooks/useClickOutside';
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll';
import globalMessages from '../../../i18n/globalMessages';
import Transition from '../../Transition';
import Button, { ButtonType } from '../Button';
import CachedImage from '../CachedImage';
import LoadingSpinner from '../LoadingSpinner';

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
  backdrop?: string;
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
  backdrop,
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
      className="fixed top-0 bottom-0 left-0 right-0 z-50 flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-70"
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
          className="relative inline-block w-full transform overflow-auto bg-gray-700 px-4 pt-5 pb-4 text-left align-bottom shadow-xl ring-1 ring-gray-500 transition-all sm:my-8 sm:max-w-3xl sm:rounded-lg sm:align-middle"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          ref={modalRef}
          style={{
            maxHeight: 'calc(100% - env(safe-area-inset-top) * 2)',
          }}
        >
          {backdrop && (
            <div className="absolute top-0 left-0 right-0 z-0 h-64 max-h-full w-full">
              <CachedImage
                alt=""
                src={backdrop}
                layout="fill"
                objectFit="cover"
                priority
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(55, 65, 81, 0.85) 0%, rgba(55, 65, 81, 1) 100%)',
                }}
              />
            </div>
          )}
          <div className="relative overflow-x-hidden sm:flex sm:items-center">
            {iconSvg && <div className="modal-icon">{iconSvg}</div>}
            <div
              className={`mt-3 truncate text-center text-white sm:mt-0 sm:text-left ${
                iconSvg ? 'sm:ml-4' : 'sm:mb-4'
              }`}
            >
              {title && (
                <span
                  className="truncate text-lg font-bold leading-6"
                  id="modal-headline"
                >
                  {title}
                </span>
              )}
            </div>
          </div>
          {children && (
            <div className="relative mt-4 text-sm leading-5 text-gray-300">
              {children}
            </div>
          )}
          {(onCancel || onOk || onSecondary || onTertiary) && (
            <div className="relative mt-5 flex flex-row-reverse justify-center sm:mt-4 sm:justify-start">
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
