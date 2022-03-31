/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Transition from '../../Transition';
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll';

interface SlideOverProps {
  show?: boolean;
  title: string;
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
        className={`z-50 fixed inset-0 overflow-hidden bg-opacity-50 bg-gray-800`}
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
                <div className="flex flex-col h-full overflow-y-scroll bg-gray-700 shadow-xl">
                  <header className="px-4 py-6 space-y-1 bg-indigo-600">
                    <div className="flex items-center justify-between space-x-3">
                      <h2 className="text-lg font-medium leading-7 text-white">
                        {title}
                      </h2>
                      <div className="flex items-center h-7">
                        <button
                          aria-label="Close panel"
                          className="text-indigo-200 transition duration-150 ease-in-out hover:text-white"
                          onClick={() => onClose()}
                        >
                          <svg
                            className="w-6 h-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
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
