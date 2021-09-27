import { BellIcon } from '@heroicons/react/outline';
import React from 'react';

const Notifications: React.FC = () => {
  return (
    <button
      className="p-1 text-gray-400 rounded-full hover:bg-gray-500 hover:text-white focus:outline-none focus:ring focus:text-white"
      aria-label="Notifications"
    >
      <BellIcon className="w-6 h-6" />
    </button>
  );
};

export default Notifications;
