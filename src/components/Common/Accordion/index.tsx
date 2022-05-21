import * as React from 'react';
import { useState } from 'react';
import AnimateHeight from 'react-animate-height';

export interface AccordionProps {
  children: (args: AccordionChildProps) => React.ReactElement<any, any> | null;
  /** If true, only one accordion item can be open at any time */
  single?: boolean;
  /** If true, at least one accordion item will always be open */
  atLeastOne?: boolean;
  initialOpenIndexes?: number[];
}
export interface AccordionChildProps {
  openIndexes: number[];
  handleClick(index: number): void;
  AccordionContent: any;
}

export const AccordionContent: React.FC<{ isOpen: boolean }> = ({
  isOpen,
  children,
}) => {
  return <AnimateHeight height={isOpen ? 'auto' : 0}>{children}</AnimateHeight>;
};

const Accordion: React.FC<AccordionProps> = ({
  single,
  atLeastOne,
  initialOpenIndexes,
  children,
}) => {
  const initialState = initialOpenIndexes || (atLeastOne && [0]) || [];
  const [openIndexes, setOpenIndexes] = useState<number[]>(initialState);

  const close = (index: number) => {
    const openCount = openIndexes.length;
    const newListOfIndexes =
      atLeastOne && openCount === 1 && openIndexes.includes(index)
        ? openIndexes
        : openIndexes.filter((i) => i !== index);

    setOpenIndexes(newListOfIndexes);
  };

  const open = (index: number) => {
    const newListOfIndexes = single ? [index] : [...openIndexes, index];
    setOpenIndexes(newListOfIndexes);
  };

  const handleItemClick = (index: number) => {
    const action = openIndexes.includes(index) ? 'closing' : 'opening';

    if (action === 'closing') {
      close(index);
    } else {
      open(index);
    }
  };

  return children({
    openIndexes: openIndexes,
    handleClick: handleItemClick,
    AccordionContent,
  });
};

export default Accordion;
