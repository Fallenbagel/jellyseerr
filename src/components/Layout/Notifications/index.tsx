import { BellIcon } from '@heroicons/react/24/outline';

const Notifications = () => {
  return (
    <button
      className="rounded-full p-1 text-gray-400 hover:bg-gray-500 hover:text-white focus:text-white focus:outline-none focus:ring"
      aria-label="Notifications"
    >
      <BellIcon className="h-6 w-6" />
    </button>
  );
};

export default Notifications;
