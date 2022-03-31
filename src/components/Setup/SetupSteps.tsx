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
      <div className="px-6 py-4 flex items-center text-sm leading-5 font-medium space-x-4">
        <div
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border-2
          ${active ? 'border-indigo-600 ' : 'border-white '}
          ${completed ? 'bg-indigo-600 border-indigo-600 ' : ''} rounded-full`}
        >
          {completed && (
            <svg
              className="w-6 h-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip="evenodd"
              />
            </svg>
          )}
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
        <div className="hidden md:block absolute top-0 right-0 h-full w-5">
          <svg
            className="h-full w-full text-gray-600"
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
