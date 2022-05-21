/* eslint-disable jsx-a11y/click-events-have-key-events */
import { XIcon } from '@heroicons/react/outline';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll';
import Transition from '../../Transition';

interface SlideOverProps {
  show?: boolean;
  title: React.ReactNode;
  subText?: string;
  onClose: () => void;
}

const SlideOver: React.FC<SlideOverProps> = ({
  show = false,
  title,
  subText,
  onClose,
  children,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const slideoverRef = useRef(null);
  useLockBodyScroll(show);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return ReactDOM.createPortal(
    <Transition
      show={show}
      appear
      enter="opacity-0 transition ease-in-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="opacity-100 transition ease-in-out duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden bg-gray-800 bg-opacity-70`}
        onClick={() => onClose()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <Transition
              show={show}
              appear
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div
                className="w-screen max-w-md"
                ref={slideoverRef}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-full flex-col overflow-y-scroll bg-gray-700 shadow-xl">
                  <header className="slideover space-y-1 bg-indigo-600 px-4">
                    <div className="flex items-center justify-between space-x-3">
                      <h2 className="text-lg font-bold leading-7 text-white">
                        {title}
                      </h2>
                      <div className="flex h-7 items-center">
                        <button
                          aria-label="Close panel"
                          className="text-indigo-200 transition duration-150 ease-in-out hover:text-white"
                          onClick={() => onClose()}
                        >
                          <XIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    {subText && (
                      <div>
                        <p className="text-sm leading-5 text-indigo-300">
                          {subText}
                        </p>
                      </div>
                    )}
                  </header>
                  <div className="relative flex-1 px-4 py-6 text-white">
                    {children}
                  </div>
                </div>
              </div>
            </Transition>
          </section>
        </div>
      </div>
    </Transition>,
    document.body
  );
};

export default SlideOver;
