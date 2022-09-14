import { useEffect, useRef } from 'react';

interface ProgressCircleProps {
  className?: string;
  progress?: number;
  useHeatLevel?: boolean;
}

const ProgressCircle = ({
  className,
  progress = 0,
  useHeatLevel,
}: ProgressCircleProps) => {
  const ref = useRef<SVGCircleElement>(null);

  let color = '';
  let emptyColor = 'text-gray-300';

  if (useHeatLevel) {
    color = 'text-green-500';

    if (progress <= 50) {
      color = 'text-yellow-500';
    }

    if (progress <= 10) {
      color = 'text-red-500';
    }

    if (progress === 0) {
      emptyColor = 'text-red-600';
    }
  }

  useEffect(() => {
    if (ref && ref.current) {
      const radius = ref.current?.r.baseVal.value;
      const circumference = (radius ?? 0) * 2 * Math.PI;
      const offset = circumference - (progress / 100) * circumference;
      ref.current.style.strokeDashoffset = `${offset}`;
      ref.current.style.strokeDasharray = `${circumference} ${circumference}`;
    }
  });

  return (
    <svg className={`${className} ${color}`} viewBox="0 0 24 24">
      <circle
        className={`${emptyColor} opacity-30`}
        stroke="currentColor"
        strokeWidth="3"
        fill="transparent"
        r="10"
        cx="12"
        cy="12"
      />
      <circle
        style={{
          transition: '0.35s stroke-dashoffset',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
        ref={ref}
        stroke="currentColor"
        strokeWidth="3"
        fill="transparent"
        r="10"
        cx="12"
        cy="12"
      />
    </svg>
  );
};

export default ProgressCircle;
