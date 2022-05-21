import React, { useRef, useState } from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import Button from '../Button';

interface ConfirmButtonProps {
  onClick: () => void;
  confirmText: React.ReactNode;
  className?: string;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  onClick,
  children,
  confirmText,
  className,
}) => {
  const ref = useRef(null);
  useClickOutside(ref, () => setIsClicked(false));
  const [isClicked, setIsClicked] = useState(false);
  return (
    <Button
      buttonType="danger"
      className={`relative overflow-hidden ${className}`}
      onClick={(e) => {
        e.preventDefault();

        if (!isClicked) {
          setIsClicked(true);
        } else {
          onClick();
        }
      }}
    >
      &nbsp;
      <div
        ref={ref}
        className={`absolute inset-0 flex h-full w-full transform-gpu items-center justify-center transition duration-300 ${
          isClicked
            ? '-translate-y-full opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        {children}
      </div>
      <div
        ref={ref}
        className={`absolute inset-0 flex h-full w-full transform-gpu items-center justify-center transition duration-300 ${
          isClicked ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {confirmText}
      </div>
    </Button>
  );
};

export default ConfirmButton;
