import React from 'react';

interface AlertProps {
  title: string;
  type?: 'warning' | 'info' | 'error';
}

const Alert: React.FC<AlertProps> = ({ title, children, type }) => {
  let design = {
    bgColor: 'bg-yellow-600',
    titleColor: 'text-yellow-200',
    textColor: 'text-yellow-300',
    svg: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  switch (type) {
    case 'info':
      design = {
        bgColor: 'bg-indigo-600',
        titleColor: 'text-indigo-200',
        textColor: 'text-indigo-300',
        svg: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      };
      break;
    case 'error':
      design = {
        bgColor: 'bg-red-600',
        titleColor: 'text-red-200',
        textColor: 'text-red-300',
        svg: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      };
      break;
  }

  return (
    <div className={`rounded-md p-4 mb-5 ${design.bgColor}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${design.titleColor}`}>{design.svg}</div>
        <div className="ml-3">
          <div className={`text-sm font-medium ${design.titleColor}`}>
            {title}
          </div>
          <div className={`mt-2 text-sm ${design.textColor}`}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
