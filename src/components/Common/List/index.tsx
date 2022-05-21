import React from 'react';
import { withProperties } from '../../../utils/typeHelpers';

interface ListItemProps {
  title: string;
  className?: string;
}

const ListItem: React.FC<ListItemProps> = ({ title, className, children }) => {
  return (
    <div>
      <div className="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="block text-sm font-bold text-gray-400">{title}</dt>
        <dd className="flex text-sm text-white sm:col-span-2 sm:mt-0">
          <span className={`flex-grow ${className}`}>{children}</span>
        </dd>
      </div>
    </div>
  );
};

interface ListProps {
  title: string;
  subTitle?: string;
}

const List: React.FC<ListProps> = ({ title, subTitle, children }) => {
  return (
    <>
      <div>
        <h3 className="heading">{title}</h3>
        {subTitle && <p className="description">{subTitle}</p>}
      </div>
      <div className="section border-t border-gray-800">
        <dl className="divide-y divide-gray-800">{children}</dl>
      </div>
    </>
  );
};

export default withProperties(List, { Item: ListItem });
