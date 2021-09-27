import { CheckIcon } from '@heroicons/react/solid';
import React from 'react';

interface CurrentStep {
  stepNumber: number;
  description: string;
  active?: boolean;
  completed?: boolean;
  isLastStep?: boolean;
}

const SetupSteps: React.FC<CurrentStep> = ({
  stepNumber,
  description,
  active = false,
  completed = false,
  isLastStep = false,
}) => {
  return (
    <li className="relative md:flex-1 md:flex">
      <div className="flex items-center px-6 py-4 space-x-4 text-sm font-medium leading-5">
        <div
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border-2
          ${active ? 'border-indigo-600 ' : 'border-white '}
          ${completed ? 'bg-indigo-600 border-indigo-600 ' : ''} rounded-full`}
        >
          {completed && <CheckIcon className="w-6 h-6 text-white" />}
          {!completed && (
            <p className={active ? 'text-white' : 'text-indigo-200'}>
              {stepNumber}
            </p>
          )}
        </div>
        <p
          className={`text-sm leading-5 font-medium ${
            active ? 'text-white' : 'text-indigo-200'
          }`}
        >
          {description}
        </p>
      </div>

      {!isLastStep && (
        <div className="absolute top-0 right-0 hidden w-5 h-full md:block">
          <svg
            className="w-full h-full text-gray-600"
            viewBox="0 0 22 80"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 -2L20 40L0 82"
              vectorEffect="non-scaling-stroke"
              stroke="currentcolor"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </li>
  );
};

export default SetupSteps;
